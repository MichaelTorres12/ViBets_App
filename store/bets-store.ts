// store/bets-store.ts
import { create } from 'zustand';
import { Bet, BetParticipation, BetStatus } from '@/types';
import { supabase } from '@/services/supabaseClient';

interface BetsState {
  bets: Bet[];
  participations: BetParticipation[];
  loading: boolean;

  getBetById: (betId: string) => Bet | undefined;
  getGroupBets: (groupId: string) => Bet[];

  // Participaciones
  getBetParticipations: (betId: string) => BetParticipation[];
  getUserParticipationInBet: (betId: string, userId: string) => BetParticipation | undefined;

  // Apuestas
  fetchBets: (groupId: string) => Promise<void>;
  participateInBet: (betId: string, userId: string, optionId: string, amount: number) => Promise<void>;
  settleBet: (betId: string, winningOptionId: string) => Promise<void>;
  createBet: (data: {
    groupId: string;
    title: string;
    description?: string;
    endDate: string;
    options: Array<{ text: string; odds: number }>;
  }) => Promise<void>;
}

export const useBetsStore = create<BetsState>((set, get) => ({
  bets: [],
  participations: [],
  loading: false,

  getBetById: (betId) => {
    return get().bets.find((bet) => bet.id === betId);
  },

  // Importante: filtra por "bet.group_id" (como en la DB)
  getGroupBets: (groupId: string) => {
    return get().bets.filter((bet) => bet.group_id === groupId);
  },

  getBetParticipations: (betId: string) => {
    return get().participations.filter((p) => p.betId === betId);
  },

  getUserParticipationInBet: (betId, userId) => {
    return get().participations.find((p) => p.betId === betId && p.userId === userId);
  },

  /** NUEVA FUNCIÓN: Trae las apuestas y sus opciones via JOIN */
  fetchBets: async (groupId: string) => {
    set({ loading: true });

    try {
      // Consulta con JOIN
      const { data, error } = await supabase
        .from('bets')
        .select(`
          *,
          bet_options (
            id,
            option_text,
            odds
          )
        `)
        .eq('group_id', groupId);

      if (error) {
        console.error('Error fetching bets:', error);
        set({ loading: false });
        return;
      }

      // Mapeamos bet_options a "options"
      const betsMapped = data.map((bet: any) => ({
        ...bet,
        options: bet.bet_options
          ? bet.bet_options.map((opt: any) => ({
              id: opt.id,
              label: opt.option_text,
              odd: parseFloat(opt.odds)
            }))
          : []
      }));

      // Log para depurar
      console.log('fetchBets - betsMapped:', betsMapped);

      // Actualiza estado
      set({ bets: betsMapped, loading: false });
    } catch (e) {
      console.error('fetchBets - exception:', e);
      set({ loading: false });
    }
  },

  participateInBet: async (betId, userId, optionId, amount) => {
    set({ loading: true });
    try {
      const existingParticipation = get().getUserParticipationInBet(betId, userId);

      if (existingParticipation) {
        const { error } = await supabase
          .from('bet_participations')
          .update({ 
            option_id: optionId,
            amount: amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingParticipation.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bet_participations')
          .insert({
            bet_id: betId,
            user_id: userId,
            option_id: optionId,
            amount: amount,
            status: 'active'
          });
        if (error) throw error;
      }

      // Si quieres refrescar luego de participar:
      // await get().fetchBets('elGroupId');
      set({ loading: false });
    } catch (error) {
      console.error('Error participating in bet:', error);
      set({ loading: false });
      throw error;
    }
  },

  settleBet: async (betId, winningOptionId) => {
    set({ loading: true });
    try {
      // Update bet status to settled
      const { error: betError } = await supabase
        .from('bets')
        .update({ 
          status: 'settled' as BetStatus,
          settled_option: winningOptionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', betId);
      if (betError) throw betError;

      // Update winners
      const { error: winnersError } = await supabase
        .from('bet_participations')
        .update({ status: 'won' })
        .eq('bet_id', betId)
        .eq('option_id', winningOptionId);
      if (winnersError) throw winnersError;

      // Update losers
      const { error: losersError } = await supabase
        .from('bet_participations')
        .update({ status: 'lost' })
        .eq('bet_id', betId)
        .neq('option_id', winningOptionId);
      if (losersError) throw losersError;

      // Si quieres refrescar:
      // await get().fetchBets('elGroupId');
      set({ loading: false });
    } catch (error) {
      console.error('Error settling bet:', error);
      set({ loading: false });
      throw error;
    }
  },

  createBet: async ({ groupId, title, description, endDate, options }) => {
    set({ loading: true });
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError || new Error('User not found');

      const { data: betData, error: betError } = await supabase
        .from('bets')
        .insert([{
          group_id: groupId,
          created_by: user.id,
          title,
          description,
          end_date: endDate,
          status: 'open'
        }])
        .select()
        .single();
      if (betError) throw betError;

      const optionsToInsert = options.map(opt => ({
        bet_id: betData.id,
        option_text: opt.text,
        odds: opt.odds
      }));

      const { error: optionsError } = await supabase
        .from('bet_options')
        .insert(optionsToInsert);
      if (optionsError) throw optionsError;

      set({ loading: false });
    } catch (error) {
      console.error('Error creating bet:', error);
      set({ loading: false });
      throw error;
    }
  },
}));
