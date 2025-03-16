import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bet, BetParticipation, BetType } from '@/types';
import { supabase } from '@/services/supabaseClient';
import { useAuthStore } from './auth-store';
import { transformBet, transformBetParticipation, transformBetOption } from '@/utils/transformers';
import { useGroupsStore } from './groups-store';

interface BetsState {
  bets: Bet[];
  participations: BetParticipation[];
  isLoading: boolean;
  error: string | null;
  // Métodos asíncronos
  createBet: (
    title: string, 
    groupId: string, 
    type: BetType, 
    options: { text: string; odds?: number }[],
    endDate: string,
    description?: string,
    minBet?: number,
    maxBet?: number
  ) => Promise<Bet>;
  fetchBets: (groupId: string) => Promise<void>;
  fetchParticipations: (betId: string) => Promise<void>;
  placeBet: (betId: string, optionId: string, amount: number) => Promise<BetParticipation>;
  settleBet: (betId: string, winningOptionId: string) => Promise<void>;
  // Getters
  getGroupBets: (groupId: string) => Bet[];
  getUserBets: (userId: string) => BetParticipation[];
  getBetById: (id: string) => Bet | undefined;
  getBetParticipations: (betId: string) => BetParticipation[];
  getUserParticipationInBet: (betId: string, userId: string) => BetParticipation | undefined;
  // NUEVO: fetchAllUserGroupBets
  fetchAllUserGroupBets: (userId: string, groupIds: string[]) => Promise<void>;
}

export const useBetsStore = create<BetsState>()(
  persist(
    (set, get) => ({
      bets: [],
      participations: [],
      isLoading: false,
      error: null,

      createBet: async (
        title,
        groupId,
        type,
        options,
        endDate,
        description,
        minBet,
        maxBet
      ) => {
        set({ isLoading: true, error: null });
        try {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError || !userData.user) throw userError || new Error('User not found');
          const userId = userData.user.id;

          // Create bet and options in a single transaction
          const { data: betData, error: betError } = await supabase
            .from('bets')
            .insert([{
              title,
              description,
              group_id: groupId,
              created_by: userId,
              type,
              end_date: endDate,
              status: 'open'
            }])
            .select()
            .single();
          
          if (betError) throw betError;
          let newBet = transformBet(betData);

          // Prepare option inserts
          const optionInserts = options.map(opt => ({
            bet_id: newBet.id,
            text: opt.text,
            name: opt.text,
            odds: opt.odds ?? 1
          }));
          
          // Insert options
          const { data: optionsData, error: optionsError } = await supabase
            .from('bet_options')
            .insert(optionInserts)
            .select();
            
          if (optionsError) throw optionsError;
          newBet.options = (optionsData as any[]).map(transformBetOption);

          // Update store state efficiently
          set(state => ({ 
            bets: [...state.bets, newBet], 
            isLoading: false 
          }));
          
          return newBet;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      fetchBets: async (groupId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('bets')
            .select('*, options:bet_options(*)')
            .eq('group_id', groupId)
            .order('created_at', { ascending: false });
          if (error) throw error;
          const bets = (data as any[]).map(transformBet);
          set({ bets, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      fetchParticipations: async (betId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('bet_participations')
            .select('*')
            .eq('bet_id', betId);
          if (error) throw error;
          const participations = (data as any[]).map(transformBetParticipation);
          set({ participations, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      placeBet: async (betId, optionId, amount) => {
        set({ isLoading: true, error: null });
        try {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError || !userData.user) throw userError || new Error('User not found');
          const userId = userData.user.id;

          const { data: betData, error: betError } = await supabase
            .from('bets')
            .select('*')
            .eq('id', betId)
            .single();
          if (betError || !betData) throw betError || new Error('Bet not found');
          const bet = transformBet(betData);
          if (bet.status !== 'open') throw new Error('This bet is no longer accepting participations');

          const { data: existingPart } = await supabase
            .from('bet_participations')
            .select('*')
            .eq('bet_id', betId)
            .eq('user_id', userId)
            .single();
          if (existingPart) throw new Error('You have already placed a bet on this event');

          // Aquí se podría verificar el saldo del usuario

          const { data: partData, error: partError } = await supabase
            .from('bet_participations')
            .insert([{
              bet_id: betId,
              user_id: userId,
              option_id: optionId,
              amount,
              status: 'active'
            }])
            .select()
            .single();
          if (partError) throw partError;
          const newParticipation = transformBetParticipation(partData);

          set(state => ({
            participations: [...state.participations, newParticipation],
            isLoading: false,
          }));
          return newParticipation;
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      settleBet: async (betId, winningOptionId) => {
        set({ isLoading: true, error: null });
        try {
          // Actualiza la apuesta en Supabase
          const { data: betData, error: betError } = await supabase
            .from('bets')
            .update({ status: 'settled', settled_option: winningOptionId })
            .eq('id', betId)
            .select()
            .single();
          if (betError) throw betError;
          const updatedBet = transformBet(betData);

          // Obtiene las participaciones para la apuesta
          const { data: partsData, error: partsError } = await supabase
            .from('bet_participations')
            .select('*')
            .eq('bet_id', betId);
          if (partsError) throw partsError;
          const betParticipations = (partsData as any[]).map(transformBetParticipation);
          const totalPot = betParticipations.reduce((sum, p) => sum + p.amount, 0);
          const winningParticipations = betParticipations.filter(p => p.optionId === winningOptionId);
          const winningPot = winningParticipations.reduce((sum, p) => sum + p.amount, 0);

          // Actualizar cada participación (forzando el tipo correcto)
          const updatedParticipations: BetParticipation[] = betParticipations.map((p) => {
            if (p.optionId === winningOptionId) {
              return { ...p, status: 'won' as 'won' };
            } else {
              return { ...p, status: 'lost' as 'lost' };
            }
          });

          // Actualizar el estado local (usamos casting a Partial<BetsState>)
          set(state => ({
            bets: state.bets.map(b => (b.id === updatedBet.id ? updatedBet : b)),
            participations: state.participations.map(p => {
              if (p.betId === betId) {
                return updatedParticipations.find(up => up.id === p.id) || p;
              }
              return p;
            }),
            isLoading: false,
          }) as Partial<BetsState>);
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      // Getters síncronos
      getGroupBets: (groupId: string) => {
        return get().bets.filter(b => b.groupId === groupId);
      },
      getUserBets: (userId: string) => {
        return get().participations.filter(p => p.userId === userId);
      },
      getBetById: (id: string) => {
        return get().bets.find(b => b.id === id);
      },
      getBetParticipations: (betId: string) => {
        return get().participations.filter(p => p.betId === betId);
      },
      getUserParticipationInBet: (betId: string, userId: string) => {
        return get().participations.find(p => p.betId === betId && p.userId === userId);
      },

      // NUEVO: fetchAllUserGroupBets
      fetchAllUserGroupBets: async (userId: string, groupIds: string[]) => {
        try {
          let allBets: Bet[] = [];
          for (const groupId of groupIds) {
            const { data, error } = await supabase
              .from('bets')
              .select('*')
              .eq('group_id', groupId)
              .order('created_at', { ascending: false });
            if (error) {
              console.error(error);
              continue;
            }
            // Transformamos cada apuesta usando transformBet
            const betsForGroup = (data as any[]).map(transformBet);
            allBets = allBets.concat(betsForGroup);
          }
          set({ bets: allBets });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },
    }),
    {
      name: 'bets-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
