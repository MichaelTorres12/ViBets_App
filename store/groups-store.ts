// store/groups-store.ts
import { create } from 'zustand';
import { supabase } from '@/services/supabaseClient';
import { Group, GroupMember, ChatMessage } from '@/types';
import { useAuthStore } from './auth-store';

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
  getGroupMembersSorted: (groupId: string) => Promise<Array<{ userId: string; username: string; avatar: string; groupCoins: number }>>;

  // Métodos para chat
  addMessage: (groupId: string, message: ChatMessage) => Promise<void>;
  getChatMessages: (groupId: string) => Promise<ChatMessage[]>;
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: [],
  isLoading: false,
  error: null,

  fetchGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      // Obtenemos los grupos con sus miembros
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select(`
          *,
          members:group_members(*)
        `);
      if (groupsError) throw groupsError;

      console.log('Grupos:', JSON.stringify(groupsData, null, 2));
      
      // Para cada grupo, obtenemos sus apuestas
      const groupsWithBets = await Promise.all(
        groupsData.map(async (group: any) => {
          const { data: betsData, error: betsError } = await supabase
            .from('bets')
            .select('*')
            .eq('group_id', group.id);
          
          if (betsError) {
            console.error('Error fetching bets:', betsError);
            return { ...group, bets: [] };
          }
          
          return { ...group, bets: betsData || [] };
        })
      );

      // Por el momento no usaremos challenges, asignamos un arreglo vacío
      const transformedGroups = groupsWithBets.map((group: any) => {
        // Transformamos los miembros para que coincidan con nuestro modelo
        const transformedMembers = group.members.map((member: any) => ({
          userId: member.user_id,
          groupCoins: member.group_coins,
          joinedAt: member.joined_at
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

  createGroup: async (name, description) => {
    set({ isLoading: true, error: null });
    try {
      // Genera un código de invitación (6 caracteres en mayúsculas)
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Obtén el usuario actual
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw userError || new Error('User not found');
      const userId = userData.user.id;

      // Inserta el nuevo grupo en la tabla groups
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert([{ name, description, invite_code: inviteCode, created_by: userId }])
        .select();
      if (groupError) throw groupError;
      const newGroup = groupData[0] as Group;

      // Inserta al creador en la tabla group_members
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{ group_id: newGroup.id, user_id: userId, group_coins: 1000 }]);
      if (memberError) throw memberError;

      // Refresca los grupos
      await get().fetchGroups();
      set({ isLoading: false });
      return newGroup;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  joinGroup: async (inviteCode) => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw userError || new Error('User not found');
      const userId = userData.user.id;

      // Busca el grupo por código de invitación
      const { data: groupsData, error: groupError } = await supabase
        .from('groups')
        .select('*, members:group_members(*)')
        .eq('invite_code', inviteCode);
      if (groupError) throw groupError;
      if (!groupsData || groupsData.length === 0) throw new Error('Invalid invite code');
      const group = groupsData[0] as Group;

      // Verifica si el usuario ya es miembro
      const isMember = group.members.some((m: any) => m.user_id === userId);
      if (isMember) throw new Error('You are already a member of this group');

      // Inserta el usuario en group_members
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

  leaveGroup: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw userError || new Error('User not found');
      const userId = userData.user.id;

      // Elimina la relación en group_members
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
    return get().groups.find(g => g.id === groupId);
  },

  getUserGroups: (userId) => {
    return get().groups.filter(g => g.members.some((m) => m.userId === userId));
  },

  getGroupMember: (groupId, userId) => {
    const group = get().getGroupById(groupId);
    if (!group) return undefined;
    return group.members.find((m) => m.userId === userId);
  },

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

  getGroupMembersSorted: async (groupId) => {
    try {
      // Se asume que existe una tabla "profiles" con información adicional del usuario
      const { data, error } = await supabase
        .from('group_members')
        .select('user_id, group_coins, joined_at, profiles(username, avatar)')
        .eq('group_id', groupId);
      if (error) throw error;
      const members = data.map((row: any) => ({
        userId: row.user_id,
        username: row.profiles.username,
        avatar: row.profiles.avatar,
        groupCoins: row.group_coins,
      }));
      return members.sort((a, b) => b.groupCoins - a.groupCoins);
    } catch (error: any) {
      set({ error: error.message });
      return [];
    }
  },

  addMessage: async (groupId, message) => {
    try {
      // Se asume que existe una tabla "chat_messages" con campo group_id
      const { error } = await supabase
        .from('chat_messages')
        .insert([{ group_id: groupId, ...message }]);
      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

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
}));
