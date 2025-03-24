// store/challenges-store.ts
import { create } from 'zustand';
import { supabase } from '@/services/supabaseClient';
import { Challenge, ChallengeJustification, ChallengeParticipation, ChallengeVote } from '@/types';
import { useAuth } from '@/store/auth-context';

interface ChallengesState {
  challenges: Challenge[];
  loading: boolean;
  // Obtener desafíos de un grupo específico
  fetchGroupChallenges: (groupId: string) => Promise<void>;
  // Crear un nuevo desafío
  createChallenge: (
    groupId: string,
    title: string,
    description: string,
    initialPrize: number,
    endDate: string
  ) => Promise<void>;
  // Participar en un desafío
  participateInChallenge: (challengeId: string, blindAmount: number) => Promise<void>;
  // Enviar justificación de completar el desafío
  submitJustification: (
    challengeId: string, 
    type: 'text' | 'image' , 
    content: string
  ) => Promise<void>;
  // Votar una justificación
  voteJustification: (
    justificationId: string, 
    approved: boolean
  ) => Promise<void>;
  // Verificar si una justificación ha sido aprobada
  checkJustificationApproval: (justificationId: string) => Promise<boolean>;
  // Completar un desafío
  completeChallenge: (challengeId: string, winnerId: string) => Promise<void>;
}

export const useChallengesStore = create<ChallengesState>((set, get) => ({
  challenges: [],
  loading: false,
  
  fetchGroupChallenges: async (groupId: string) => {
    set({ loading: true });
  
    // Query con JOIN a profiles
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select(`
        *,
        participants:challenge_participations(
          *,
          profile:user_id (username)
        ),
        justifications:challenge_justifications(*)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
  
    if (error) {
      console.error("Error fetching challenges:", error);
    } else if (challenges) {
      // Calcular totalPrize para cada desafío
      const enhancedChallenges = challenges.map((challenge: any) => {
        const totalBlind = (challenge.participants || [])
          .reduce((sum: number, p: any) => sum + (p.blind_amount || 0), 0);
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
    
    // Obtener el usuario actual
    const { user } = useAuth();
    if (!user) {
      console.error("User not authenticated");
      set({ loading: false });
      return;
    }
    
    const newChallenge = {
      group_id: groupId,                   // usa group_id
      title,
      description,
      initial_prize: initialPrize,         // usa initial_prize
      end_date: endDate,
      created_by: user.id,                 // usa created_by
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
      // Añade el nuevo desafío al estado local
      set((state) => ({ 
        challenges: [
          { ...data[0], participants: [], justifications: [], totalPrize: data[0].initial_prize },
          ...state.challenges
        ] 
      }));
    }
    
    set({ loading: false });
  },
  
  participateInChallenge: async (challengeId, blindAmount, userId: string) => {
    // Verificar que el valor del "blind" esté entre 50-100
    if (blindAmount < 50 || blindAmount > 100) {
      console.error("Blind amount must be between 50 and 100");
      return;
    }
    
    // Ya no llamamos a useAuth() aquí; usamos el parámetro userId
    // Verificar que el usuario no haya participado ya
    const { data: existingParticipation } = await supabase
      .from('challenge_participations')
      .select('*')
      .eq('challenge_id', challengeId)   // Asegúrate de usar el nombre correcto de columna
      .eq('user_id', userId)
      .single();
    
    if (existingParticipation) {
      console.error("User already participates in this challenge");
      return;
    }
    
    // Registrar la participación
    const participation = {
      challenge_id: challengeId,   // Asegúrate de usar los nombres correctos de columna
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
    } else {
      // Actualizar el estado local si lo necesitas
      set((state) => {
        const updatedChallenges = state.challenges.map(challenge => {
          if (challenge.id === challengeId) {
            const participants = [...(challenge.participants || []), data[0]];
            const totalBlind = participants.reduce((sum, p) => sum + (p.blindAmount || 0), 0);
            return {
              ...challenge,
              participants,
              totalPrize: challenge.initialPrize + totalBlind
            };
          }
          return challenge;
        });
        return { challenges: updatedChallenges };
      });
    }
  },
  
  
  submitJustification: async (challengeId, type, content) => {
    // Obtener el usuario actual
    const { user } = useAuth();
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    
    // Verificar que el usuario participe en el desafío
    const { data: participation } = await supabase
      .from('challenge_participations')
      .select('*')
      .eq('challengeId', challengeId)
      .eq('userId', user.id)
      .single();
    
    if (!participation) {
      console.error("User does not participate in this challenge");
      return;
    }
    
    // Enviar la justificación
    const justification = {
      challengeId,
      userId: user.id,
      type,
      content,
      createdAt: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('challenge_justifications')
      .insert([justification])
      .select();
    
    if (error) {
      console.error("Error submitting justification:", error);
    } else {
      // Actualizar el estado local
      set((state) => {
        const updatedChallenges = state.challenges.map(challenge => {
          if (challenge.id === challengeId) {
            return {
              ...challenge,
              justifications: [...(challenge.justifications || []), data[0]]
            };
          }
          return challenge;
        });
        
        return { challenges: updatedChallenges };
      });
    }
  },
  
  voteJustification: async (justificationId, approved) => {
    // Obtener el usuario actual
    const { user } = useAuth();
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    
    // Registrar el voto
    const vote = {
      justificationId,
      userId: user.id,
      approved,
      createdAt: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('challenge_votes')
      .insert([vote]);
    
    if (error) {
      console.error("Error voting on justification:", error);
    } else {
      // Actualizar el estado local si es necesario
      // También verificar si el desafío ha sido completado
      const { data: justification } = await supabase
        .from('challenge_justifications')
        .select('challengeId, userId')
        .eq('id', justificationId)
        .single();
      
      if (justification) {
        const isApproved = await get().checkJustificationApproval(justificationId);
        
        if (isApproved) {
          // Completar el desafío
          await get().completeChallenge(justification.challengeId, justification.userId);
        }
      }
    }
  },
  
  checkJustificationApproval: async (justificationId) => {
    // Obtener la justificación
    const { data: justification } = await supabase
      .from('challenge_justifications')
      .select('challengeId')
      .eq('id', justificationId)
      .single();
    
    if (!justification) return false;
    
    // Obtener el desafío para saber a qué grupo pertenece
    const { data: challenge } = await supabase
      .from('challenges')
      .select('groupId')
      .eq('id', justification.challengeId)
      .single();
    
    if (!challenge) return false;
    
    // Obtener el total de miembros del grupo
    const { data: groupMembers, count } = await supabase
      .from('group_members')
      .select('userId', { count: 'exact' })
      .eq('groupId', challenge.groupId);
    
    const totalMembers = count || 0;
    
    // Obtener los votos para esta justificación
    const { data: votes } = await supabase
      .from('challenge_votes')
      .select('*')
      .eq('justificationId', justificationId);
    
    if (!votes) return false;
    
    // Contar votos positivos
    const approvedVotes = votes.filter(vote => vote.approved).length;
    
    // Verificar si alcanza el umbral (50%+1 o 50% en caso de empate)
    const threshold = Math.ceil(totalMembers / 2);
    return approvedVotes >= threshold;
  },
  
  completeChallenge: async (challengeId, winnerId) => {
    // Actualizar el estado del desafío a 'completed' y establecer el ganador
    const { error } = await supabase
      .from('challenges')
      .update({ status: 'completed', winner: winnerId })
      .eq('id', challengeId);
    
    if (error) {
      console.error("Error completing challenge:", error);
    } else {
      // Actualizar el estado local
      set((state) => {
        const updatedChallenges = state.challenges.map(challenge => {
          if (challenge.id === challengeId) {
            return { ...challenge, status: 'completed', winner: winnerId };
          }
          return challenge;
        });
        
        return { challenges: updatedChallenges };
      });
      
      // Aquí se debería implementar la lógica para transferir el premio al ganador
      // Por ejemplo, actualizar coins en la tabla de usuarios o group_members
    }
  }
}));
