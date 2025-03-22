// store/groups-store.ts
import { create } from 'zustand';
import { supabase } from '@/services/supabaseClient';
import { Group, GroupMember, ChatMessage, Challenge } from '@/types';

interface GroupsState {
  groups: Group[];
  isLoading: boolean;
  error: string | null;

  // Métodos para grupos
  fetchGroups: () => Promise<void>;
  createGroup: (name: string, description?: string) => Promise<Group | null>;
  joinGroup: (inviteCode: string) => Promise<Group | null>;
  leaveGroup: (groupId: string) => Promise<void>;
  getGroupById: (groupId: string) => Group | undefined;
  getUserGroups: (userId: string) => Group[];
  getGroupMember: (groupId: string, userId: string) => GroupMember | undefined;
  updateGroupCoins: (groupId: string, userId: string, amount: number) => Promise<void>;
  getGroupMembersSorted: (
    groupId: string
  ) => Promise<Array<{ userId: string; username: string; avatar: string; groupCoins: number }>>;
  createChallenge: (groupId: string, newChallenge: Omit<Challenge, 'id'>) => Promise<void>;

  // Métodos para chat
  addMessage: (groupId: string, message: ChatMessage) => Promise<void>;
  getChatMessages: (groupId: string) => Promise<ChatMessage[]>;

  fetchGroupMembers: (groupId: string) => Promise<void>;

  // Método para crear apuestas
  createBet: (
    groupId: string,
    title: string,
    description?: string,
    end_date?: string
  ) => Promise<any>;
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: [],
  isLoading: false,
  error: null,

  /**
   * Obtiene todos los grupos junto con sus miembros y datos de perfil (username).
   * Además, se trae la información de apuestas de cada grupo.
   */
  fetchGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select(`
          *,
          members:group_members(
            user_id,
            group_coins,
            joined_at,
            profiles:profiles(username)
          )
        `);
      if (groupsError) throw groupsError;

      console.log('Grupos:', JSON.stringify(groupsData, null, 2));

      // Para cada grupo se obtienen sus apuestas
      const groupsWithBets = await Promise.all(
        groupsData.map(async (group: any) => {
          const { data: betsData, error: betsError } = await supabase
          .from('bets')
          .select(`
            *,
            bet_options (
              id,
              option_text,
              odds
            ),
            bet_participations (
              id,
              user_id,
              option_id,
              amount,
              created_at
            )
          `)
          .eq('group_id', group.id);
          if (betsError) {
            console.error('Error fetching bets:', betsError);
            return { ...group, bets: [] };
          }

          // Mapeamos las apuestas para que bet_options quede en "options"
          const betsWithOptions = (betsData || []).map((bet: any) => ({
            ...bet,
            options: bet.bet_options
              ? bet.bet_options.map((opt: any) => ({
                  id: opt.id,
                  label: opt.option_text,
                  odd: parseFloat(opt.odds),
                }))
              : [],
            participations: bet.bet_participations || [],
          }));

          return { ...group, bets: betsWithOptions };
        })
      );

      // Transformamos los grupos y sus miembros
      const transformedGroups = groupsWithBets.map((group: any) => {
        const transformedMembers = group.members.map((member: any) => ({
          userId: member.user_id,
          groupCoins: member.group_coins,
          joinedAt: member.joined_at,
          username: member.profiles?.username ?? 'Unknown User',
          avatar: member.profiles?.avatar ?? '',
        }));

        return {
          id: group.id,
          name: group.name,
          description: group.description,
          avatar: group.avatar,
          createdBy: group.created_by,
          members: transformedMembers,
          createdAt: group.created_at,
          inviteCode: group.invite_code,
          bets: group.bets || [],
          challenges: [] // Valor por defecto: sin challenges
        };
      });

      set({ groups: transformedGroups as Group[], isLoading: false });
    } catch (err: any) {
      console.error('Error in fetchGroups:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  /**
   * Crea un nuevo grupo y agrega al creador como miembro.
   */
  createGroup: async (name, description) => {
    set({ isLoading: true, error: null });
    try {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw userError || new Error('User not found');
      const userId = userData.user.id;

      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert([{ name, description, invite_code: inviteCode, created_by: userId }])
        .select();
      if (groupError) throw groupError;
      const newGroup = groupData[0] as Group;

      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{ group_id: newGroup.id, user_id: userId, group_coins: 1000 }]);
      if (memberError) throw memberError;

      await get().fetchGroups();
      set({ isLoading: false });
      return newGroup;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  /**
   * Permite unirse a un grupo mediante un código de invitación.
   */
  joinGroup: async (inviteCode) => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw userError || new Error('User not found');
      const userId = userData.user.id;

      const { data: groupsData, error: groupError } = await supabase
        .from('groups')
        .select(`
          *,
          members:group_members(
            user_id,
            group_coins,
            joined_at,
            profiles:profiles(username)
          )
        `)
        .eq('invite_code', inviteCode);
      if (groupError) throw groupError;
      if (!groupsData || groupsData.length === 0) throw new Error('Invalid invite code');
      const group = groupsData[0] as Group;

      const isMember = group.members.some((m: any) => m.user_id === userId);
      if (isMember) throw new Error('You are already a member of this group');

      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{ group_id: group.id, user_id: userId, group_coins: 1000 }]);
      if (memberError) throw memberError;

      await get().fetchGroups();
      set({ isLoading: false });
      return group;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Permite salir de un grupo eliminando la relación en group_members.
   */
  leaveGroup: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw userError || new Error('User not found');
      const userId = userData.user.id;

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);
      if (error) throw error;

      await get().fetchGroups();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getGroupById: (groupId) => {
    return get().groups.find((g) => g.id === groupId);
  },

  getUserGroups: (userId) => {
    return get().groups.filter((g) => g.members.some((m) => m.userId === userId));
  },

  /**
   * Retorna un miembro de un grupo, asegurándose de que 'username' sea un string.
   */
  getGroupMember: (groupId, userId) => {
    const group = get().getGroupById(groupId);
    if (!group) return undefined;
    return group.members.find((m) => m.userId === userId) || { 
      userId, 
      username: 'Unknown User', 
      groupCoins: 0, 
      joinedAt: '' 
    };
  },

  /**
   * Actualiza las monedas de un miembro en un grupo y refresca la lista.
   */
  updateGroupCoins: async (groupId, userId, amount) => {
    try {
      const { data: memberData, error: fetchError } = await supabase
        .from('group_members')
        .select('group_coins')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();
      if (fetchError) throw fetchError;
      const newCoins = (memberData.group_coins || 0) + amount;
      const { error: updateError } = await supabase
        .from('group_members')
        .update({ group_coins: newCoins })
        .eq('group_id', groupId)
        .eq('user_id', userId);
      if (updateError) throw updateError;
      await get().fetchGroups();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Obtiene los miembros de un grupo ordenados por monedas.
   */
  getGroupMembersSorted: async (groupId) => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('user_id, group_coins, joined_at, profiles(username, avatar)')
        .eq('group_id', groupId);
      if (error) throw error;
      const members = data.map((row: any) => {
        const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        return {
          userId: row.user_id,
          username: profile?.username ?? 'Unknown User',
          avatar: profile?.avatar ?? '',
          groupCoins: row.group_coins,
        };
      });
      return members.sort((a, b) => b.groupCoins - a.groupCoins);
    } catch (error: any) {
      set({ error: error.message });
      return [];
    }
  },

  /**
   * Agrega un mensaje al chat del grupo.
   */
  addMessage: async (groupId, message) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{ group_id: groupId, ...message }]);
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Obtiene los mensajes del chat del grupo, ordenados por timestamp.
   */
  getChatMessages: async (groupId) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('timestamp', { ascending: true });
      if (error) throw error;
      return data as ChatMessage[];
    } catch (error: any) {
      set({ error: error.message });
      return [];
    }
  },

  /**
   * Obtiene los miembros de un grupo (consulta individual) y actualiza el store.
   */
  fetchGroupMembers: async (groupId: string) => {
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select(`
          user_id,
          group_coins,
          joined_at,
          profiles:user_id (
            username,
            avatar
          )
        `)
        .eq('group_id', groupId);
      if (membersError) throw membersError;

      const members: GroupMember[] = membersData.map((member: any) => ({
        userId: member.user_id,
        username: member.profiles?.username ?? 'Unknown User',
        groupCoins: member.group_coins,
        joinedAt: member.joined_at,
      }));

      const groups = get().groups.map((group) => {
        if (group.id === groupId) {
          return { ...group, members };
        }
        return group;
      });
      set({ groups });
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  },

  /**
   * Crea una apuesta para un grupo, inserta en la tabla bets y refresca los grupos.
   */
  createBet: async (
    groupId: string,
    title: string,
    description?: string,
    end_date?: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('bets')
        .insert([{ group_id: groupId, title, description, end_date }])
        .select();
      if (error) throw error;
      
      await get().fetchGroups();
      set({ isLoading: false });
      return data[0];
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  createChallenge: async (groupId, newChallenge) => {
    try {
      // Aquí podrías hacer un insert en tu tabla de 'challenges' en Supabase,
      // relacionándolo con el groupId, por ejemplo:
      const { data, error } = await supabase
        .from('challenges')
        .insert([{ 
          group_id: groupId,
          title: newChallenge.title,
          description: newChallenge.description,
          reward: newChallenge.reward,
          progress: 0,
          end_date: newChallenge.endDate,
          created_by: newChallenge.createdBy,
          created_at: newChallenge.createdAt,
          // etc. Agrega lo que necesites
        }])
        .select();
      if (error) throw error;

      const insertedChallenge = data?.[0];
      // Si tuvieras una tabla 'challenge_tasks', insertarías también las tasks con challenge_id = insertedChallenge.id
      // ...
      // Por simplicidad, lo omitimos aquí.

      console.log('Challenge creado:', insertedChallenge);
    } catch (err: any) {
      console.error('Error creando challenge:', err);
      throw err;
    }
  }
}));
