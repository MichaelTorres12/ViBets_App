import { create } from 'zustand';
import { Bet, BetParticipation, BetStatus } from '@/types'; // Asegúrate de que tengas el tipo Bet definido en tu proyecto
import { supabase } from '@/services/supabaseClient';

interface BetsState {
  bets: Bet[];                          // Array de apuestas
  participations: BetParticipation[];   // Array de participaciones de usuarios en apuestas
  loading: boolean;                     // Loading state for async operations

  getBetById: (betId: string) => Bet | undefined;
  getGroupBets: (groupId: string) => Bet[];
  
  // Participaciones por bet
  getBetParticipations: (betId: string) => BetParticipation[];
  getUserParticipationInBet: (betId: string, userId: string) => BetParticipation | undefined;
  
  // New functions
  participateInBet: (betId: string, userId: string, optionId: string, amount: number) => Promise<void>;
  settleBet: (betId: string, winningOptionId: string) => Promise<void>;
}

export const useBetsStore = create<BetsState>((set, get) => ({
  bets: [],
  participations: [],
  loading: false,

  getBetById: (betId) => {
    return get().bets.find((bet) => bet.id === betId);
  },

  getGroupBets: (groupId: string) => {
    return get().bets.filter((bet) => bet.groupId === groupId);
  },

  getBetParticipations: (betId) => {
    return get().participations.filter((p) => p.betId === betId);
  },

  getUserParticipationInBet: (betId, userId) => {
    return get().participations.find((p) => p.betId === betId && p.userId === userId);
  },
  
  participateInBet: async (betId, userId, optionId, amount) => {
    set({ loading: true });
    try {
      // Check if user already participated
      const existingParticipation = get().getUserParticipationInBet(betId, userId);
      
      if (existingParticipation) {
        // Update existing participation
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
        // Create new participation
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
      
      // Refresh bets data
      // You would need to implement a fetchBets function to refresh the data
      // await get().fetchBets();
      
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
      
      // Update participations status
      const participations = get().getBetParticipations(betId);
      
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
      
      // Refresh bets data
      // await get().fetchBets();
      
      set({ loading: false });
    } catch (error) {
      console.error('Error settling bet:', error);
      set({ loading: false });
      throw error;
    }
  }
}));
