import { create } from 'zustand';
import { supabase } from '@/services/supabaseClient';
import { Challenge, ChallengeJustification, ChallengeParticipation, ChallengeVote } from '@/types';
import { useAuth } from '@/store/auth-context';

interface ChallengesState {
  challenges: Challenge[];
  loading: boolean;
  fetchGroupChallenges: (groupId: string) => Promise<void>;
  createChallenge: (
    groupId: string,
    title: string,
    description: string,
    initialPrize: number,
    endDate: string
  ) => Promise<void>;
  participateInChallenge: (challengeId: string, blindAmount: number, userId: string) => Promise<void>;
  submitJustification: (
    challengeId: string,
    type: 'text' | 'image',
    content: string
  ) => Promise<void>;
  voteJustification: (justificationId: string, approved: boolean) => Promise<void>;
  checkJustificationApproval: (justificationId: string) => Promise<boolean>;
  completeChallenge: (challengeId: string, winnerId: string) => Promise<void>;
}

export const useChallengesStore = create<ChallengesState>((set, get) => ({
  challenges: [],
  loading: false,

  fetchGroupChallenges: async (groupId: string) => {
    set({ loading: true });
    // Incluimos en el select un JOIN para traer participantes y justifications, y dentro de justifications traemos los votos.
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select(`
        *,
        participants:challenge_participations(*, profile:profiles(username)),
        justifications:challenge_justifications(*, votes:challenge_votes(*))
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error("Error fetching challenges:", error);
    } else if (challenges) {
      // Calculamos totalPrize: initial_prize + la suma de los blinds de los participantes.
      const enhancedChallenges = challenges.map((challenge: any) => {
        const totalBlind = (challenge.participants || []).reduce((sum: number, p: any) => {
          return sum + (p.blind_amount || 0);
        }, 0);
        return {
          ...challenge,
          totalPrize: (challenge.initial_prize || 0) + totalBlind,
        };
      });
      set({ challenges: enhancedChallenges });
    }
    set({ loading: false });
  },

  createChallenge: async (groupId, title, description, initialPrize, endDate) => {
    set({ loading: true });
    const { user } = useAuth();
    if (!user) {
      console.error("User not authenticated");
      set({ loading: false });
      return;
    }
    const newChallenge = {
      group_id: groupId,
      title,
      description,
      initial_prize: initialPrize,
      end_date: endDate,
      created_by: user.id,
      created_at: new Date().toISOString(),
      status: 'open'
    };
    const { data, error } = await supabase
      .from('challenges')
      .insert([newChallenge])
      .select();
    if (error) {
      console.error("Error creating challenge:", error);
    } else if (data && data.length > 0) {
      set((state) => ({
        challenges: [
          { 
            ...data[0],
            participants: [],
            justifications: [],
            totalPrize: data[0].initial_prize 
          },
          ...state.challenges
        ]
      }));
    }
    set({ loading: false });
  },

  participateInChallenge: async (challengeId, blindAmount, userId: string) => {
    if (blindAmount < 50 || blindAmount > 100) {
      console.error("Blind amount must be between 50 and 100");
      return;
    }
    // Verifica si ya participa
    const { data: existingParticipation } = await supabase
      .from('challenge_participations')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .single();
    if (existingParticipation) {
      console.error("User already participates in this challenge");
      return;
    }
    const participation = {
      challenge_id: challengeId,
      user_id: userId,
      blind_amount: blindAmount,
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('challenge_participations')
      .insert([participation])
      .select();
    if (error) {
      console.error("Error participating in challenge:", error);
    }
  },

  submitJustification: async (challengeId, type, content) => {
    const { user } = useAuth();
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    // Verifica que el usuario participe en el challenge
    const { data: participation } = await supabase
      .from('challenge_participations')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', user.id)
      .single();
    if (!participation) {
      console.error("User does not participate in this challenge");
      return;
    }
    const justification = {
      challenge_id: challengeId,
      user_id: user.id,
      type,
      content,
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('challenge_justifications')
      .insert([justification])
      .select();
    if (error) {
      console.error("Error submitting justification:", error);
    }
  },

  voteJustification: async (justificationId, approved) => {
    const { user } = useAuth();
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    const vote = {
      justification_id: justificationId,
      user_id: user.id,
      approved,
      created_at: new Date().toISOString()
    };
    const { error } = await supabase
      .from('challenge_votes')
      .insert([vote]);
    if (error) {
      console.error("Error voting on justification:", error);
    }
  },

  checkJustificationApproval: async (justificationId) => {
    // Obtener la justificación para saber a qué challenge pertenece
    const { data: justification, error: justifError } = await supabase
      .from('challenge_justifications')
      .select('challenge_id')
      .eq('id', justificationId)
      .single();
    if (justifError || !justification) {
      console.error("Error fetching justification:", justifError);
      return false;
    }
    // Obtener el challenge para obtener group_id
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('group_id')
      .eq('id', justification.challenge_id)
      .single();
    if (challengeError || !challenge) {
      console.error("Error fetching challenge:", challengeError);
      return false;
    }
    // Obtener miembros del grupo
    const { data: groupMembers, count } = await supabase
      .from('group_members')
      .select('user_id', { count: 'exact' })
      .eq('group_id', challenge.group_id);
    const totalMembers = count || 0;
    // Obtener votos para esta justificación
    const { data: votes } = await supabase
      .from('challenge_votes')
      .select('*')
      .eq('justification_id', justificationId);
    if (!votes) return false;
    const approvedVotes = votes.filter((v: any) => v.approved).length;
    // Fórmula solicitada:
    // Si totalMembers es par, threshold = totalMembers/2 + 1, si no, threshold = Math.ceil(totalMembers/2)
    const threshold = totalMembers % 2 === 0 ? (totalMembers / 2 + 1) : Math.ceil(totalMembers / 2);
    return approvedVotes >= threshold;
  },

  completeChallenge: async (challengeId, winnerId) => {
    const { error } = await supabase
      .from('challenges')
      .update({ status: 'completed', winner: winnerId })
      .eq('id', challengeId);
    if (error) {
      console.error("Error completing challenge:", error);
    } else {
      set((state) => ({
        challenges: state.challenges.map((challenge) =>
          challenge.id === challengeId ? { ...challenge, status: 'completed', winner: winnerId } : challenge
        )
      }));
      // Aquí podrías incluir lógica adicional, por ejemplo, transferir el premio.
    }
  },
}));
