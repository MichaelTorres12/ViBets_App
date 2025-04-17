// store/challenges-store.ts
import { create } from 'zustand';
import { supabase } from '@/services/supabaseClient';
import {
  Challenge,
  ChallengeStatus,
  ChallengeParticipation,
  ChallengeJustification,
} from '@/types';
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
  participateInChallenge: (
    challengeId: string,
    blind: number,
    userId: string
  ) => Promise<void>;
  submitJustification: (
    challengeId: string,
    type: 'text' | 'image',
    content: string
  ) => Promise<void>;
  voteJustification: (justificationId: string, approved: boolean) => Promise<void>;
  completeChallenge: (challengeId: string, winnerId: string) => Promise<void>;
}

export const useChallengesStore = create<ChallengesState>()((set, get) => {
  /* -------------------------------------------------------------------- */
  /*                             INITIAL STATE                            */
  /* -------------------------------------------------------------------- */
  set({ challenges: [], loading: false });

  /* -------------------------------------------------------------------- */
  /*                        REAL‑TIME CHANGES (pg)                         */
  /* -------------------------------------------------------------------- */
  supabase
    .channel('rt-challenges')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'challenges' },
      (payload) => {
        const updated = payload.new;
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === updated.id
              ? {
                  ...c,
                  status: updated.status as ChallengeStatus,
                  finalPrize: updated.final_prize,
                  settledAt: updated.settled_at,
                  winner: updated.winner,
                }
              : c
          ),
        }));
      }
    )
    .subscribe();

  /* -------------------------------------------------------------------- */
  /*                              ACTIONS                                 */
  /* -------------------------------------------------------------------- */
  return {
    challenges: [],
    loading: false,

    /* ------------------------- FETCH GROUP DATA ------------------------ */
    fetchGroupChallenges: async (groupId: string) => {
      set({ loading: true });

      const { data, error } = await supabase
        .from('challenges')
        .select(
          `
        *,
        challenge_participations(*, profiles(username)),
        challenge_justifications(*, votes:challenge_votes(*))
      `
        )
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching challenges:', error);
        set({ loading: false });
        return;
      }

      const mapped: Challenge[] = (data || []).map((c: any) => {
        const blinds = (c.challenge_participations || []).reduce(
          (sum: number, p: any) => sum + (p.blind_amount || 0),
          0
        );

        return {
          id: c.id,
          groupId: c.group_id,
          title: c.title,
          description: c.description,
          initialPrize: c.initial_prize,
          finalPrize: c.final_prize,
          status: c.status as ChallengeStatus,
          winner: c.winner,
          endDate: c.end_date,
          settledAt: c.settled_at,
          createdBy: c.created_by,
          createdAt: c.created_at,
          participants: (c.challenge_participations || []).map((p: any) => ({
            id: p.id,
            challengeId: c.id,
            userId: p.user_id,
            username: p.profiles?.username,
            avatar: undefined,
            blindAmount: p.blind_amount,
            status: p.status,
            createdAt: p.created_at,
          })) as ChallengeParticipation[],
          justifications: c.challenge_justifications as ChallengeJustification[],
          totalPrize: (c.initial_prize || 0) + blinds,
        };
      });

      set({ challenges: mapped, loading: false });
    },

    /* --------------------------- CREATE ------------------------------- */
    createChallenge: async (
      groupId,
      title,
      description,
      initialPrize,
      endDate
    ) => {
      const { user } = useAuth();
      if (!user) return;

      set({ loading: true });

      const { data, error } = await supabase
        .from('challenges')
        .insert([
          {
            group_id: groupId,
            title,
            description,
            initial_prize: initialPrize,
            end_date: endDate,
            created_by: user.id,
            status: 'open',
          },
        ])
        .select('*')
        .single();

      if (error) console.error(error);
      if (data) {
        set((state) => ({
          challenges: [
            {
              id: data.id,
              groupId: groupId,
              title,
              description,
              initialPrize,
              finalPrize: initialPrize,
              status: 'open',
              endDate,
              createdBy: user.id,
              createdAt: data.created_at,
              participants: [],
              justifications: [],
              totalPrize: initialPrize,
            },
            ...state.challenges,
          ],
        }));
      }
      set({ loading: false });
    },

    /* --------------------------- PARTICIPATE -------------------------- */
    participateInChallenge: async (challengeId, blind, userId) => {
      if (blind < 50 || blind > 100) {
        console.error('Blind must be 50‑100');
        return;
      }

      const { data: exists } = await supabase
        .from('challenge_participations')
        .select('id')
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .single();

      if (exists) {
        console.error('Already participating');
        return;
      }

      const { error } = await supabase.from('challenge_participations').insert([
        {
          challenge_id: challengeId,
          user_id: userId,
          blind_amount: blind,
          status: 'active',
        },
      ]);

      if (error) console.error(error);
    },

    /* --------------------------- JUSTIFICATIONS ----------------------- */
    submitJustification: async (challengeId, type, content) => {
      const { user } = useAuth();
      if (!user) return;

      await supabase.from('challenge_justifications').insert([
        {
          challenge_id: challengeId,
          user_id: user.id,
          type,
          content,
        },
      ]);
    },

    voteJustification: async (justificationId, approved) => {
      const { user } = useAuth();
      if (!user) return;

      const { error } = await supabase.from('challenge_votes').insert([
        {
          justification_id: justificationId,
          user_id: user.id,
          approved,
        },
      ]);
      if (error) console.error(error);
    },

    /* --------------------------- COMPLETE ----------------------------- */
    completeChallenge: async (challengeId, winnerId) => {
      const { error } = await supabase
        .from('challenges')
        .update({ status: 'completed', winner: winnerId })
        .eq('id', challengeId);

      if (error) console.error(error);
    },
  };
});
