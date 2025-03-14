// store/groups-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Group, Challenge, ChatMessage } from '@/types';
import { useAuthStore } from './auth-store';

interface GroupsState {
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  
  // Group actions
  createGroup: (name: string, description?: string) => Promise<Group>;
  joinGroup: (inviteCode: string) => Promise<Group>;
  leaveGroup: (groupId: string) => Promise<void>;
  getGroupById: (groupId: string) => Group | undefined;
  getUserGroups: (userId: string) => Group[];
  getGroupMember: (groupId: string, userId: string) => { userId: string; groupCoins: number; joinedAt: string } | undefined;
  updateGroupCoins: (groupId: string, userId: string, amount: number) => void;
  getGroupMembersSorted: (groupId: string) => Array<{ userId: string; username: string; avatar: string; groupCoins: number }>;
  
  // Chat actions
  addMessage: (groupId: string, message: ChatMessage) => void;
  getChatMessages: (groupId: string) => ChatMessage[];
  
  // Challenge actions
  createChallenge: (groupId: string, challenge: Omit<Challenge, 'id'>) => Promise<Challenge>;
  getChallenges: (groupId: string) => Challenge[];
  getChallengeById: (groupId: string, challengeId: string) => Challenge | undefined;
  completeChallenge: (groupId: string, challengeId: string, userId: string) => void;
  completeTask: (groupId: string, challengeId: string, taskId: string) => void;
}

// NOTA: Se elimina Task de la importación, ya que no existe en tus tipos.

// Para los datos mock, se ajusta la propiedad members para usar objetos GroupMember
const mockGroups: Group[] = [
  {
    id: 'g1',
    name: 'Sports Fanatics',
    description: 'A group for sports betting enthusiasts',
    avatar: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=200&auto=format&fit=crop',
    inviteCode: 'ABC123',
    // Ahora members es un array de GroupMember
    members: [
      { userId: 'user1', groupCoins: 1000, joinedAt: new Date().toISOString() },
      { userId: 'user2', groupCoins: 1500, joinedAt: new Date().toISOString() },
      { userId: 'user3', groupCoins: 800, joinedAt: new Date().toISOString() },
    ],
    chatMessages: [
      {
        id: 'm1',
        sender: 'John Doe',
        avatar: '',
        message: "Hey everyone! Who's excited for the game tonight?",
        timestamp: '9:15 AM',
      },
      {
        id: 'm2',
        sender: 'Jane Smith',
        avatar: '',
        message: "I am! I think the Lakers are going to crush it.",
        timestamp: '9:20 AM',
      },
      {
        id: 'm3',
        sender: 'Mike Johnson',
        avatar: '',
        message: "I am in! I bet it breaks $200M opening weekend.",
        timestamp: '9:25 AM',
      },
    ],
    challenges: [
      {
        id: 'c1',
        title: 'Weekly Winner',
        description: 'Win the most bets in a week',
        reward: '200 coins',
        progress: 75,
        endDate: 'May 30, 2023',
        tasks: [
          {
            id: 't1',
            description: 'Place at least 5 bets',
            reward: '50 coins',
            completed: true,
            progress: 5,
            total: 5,
          },
          {
            id: 't2',
            description: 'Win 3 bets in a row',
            reward: '75 coins',
            completed: false,
            progress: 2,
            total: 3,
          },
          {
            id: 't3',
            description: 'Invite a friend to the group',
            reward: '25 coins',
            completed: true,
            progress: 1,
            total: 1,
          },
        ],
        leaderboard: [
          { rank: 1, name: 'John Doe', wins: 8, avatar: '' },
          { rank: 2, name: 'Jane Smith', wins: 6, avatar: '' },
          { rank: 3, name: 'Mike Johnson', wins: 5, avatar: '' },
          { rank: 4, name: 'Sarah Williams', wins: 3, avatar: '' },
          { rank: 5, name: 'David Brown', wins: 2, avatar: '' },
        ],
        createdBy: '',
        createdAt: ''
      },
      {
        id: 'c2',
        title: 'Betting Streak',
        description: 'Maintain a winning streak',
        reward: '150 coins',
        progress: 40,
        endDate: 'June 15, 2023',
        tasks: [
          {
            id: 't1',
            description: 'Win 5 consecutive bets',
            reward: '100 coins',
            completed: false,
            progress: 2,
            total: 5,
          },
          {
            id: 't2',
            description: 'Bet on 3 different sports',
            reward: '50 coins',
            completed: false,
            progress: 1,
            total: 3,
          },
        ],
        participants: [
          { name: 'John Doe', currentStreak: 2, bestStreak: 4, avatar: '' },
          { name: 'Jane Smith', currentStreak: 3, bestStreak: 3, avatar: '' },
          { name: 'Mike Johnson', currentStreak: 0, bestStreak: 5, avatar: '' },
        ],
        createdBy: '',
        createdAt: ''
      },
      {
        id: 'c3',
        title: 'High Roller',
        description: 'Place a bet of 500 coins or more',
        reward: '250 coins',
        progress: 100,
        endDate: 'Completed',
        tasks: [
          {
            id: 't1',
            description: 'Place a bet of 500 coins',
            reward: '250 coins',
            completed: true,
            progress: 1,
            total: 1,
          },
        ],
        completedBy: [
          { name: 'Jane Smith', date: 'May 10, 2023', betAmount: 750, avatar: '' },
          { name: 'Mike Johnson', date: 'May 12, 2023', betAmount: 500, avatar: '' },
          { name: 'John Doe', date: 'May 15, 2023', betAmount: 1000, avatar: '' },
        ],
        createdBy: '',
        createdAt: ''
      },
    ],
    createdBy: '',
    createdAt: ''
  },
  {
    id: 'g2',
    name: 'Movie Buffs',
    description: 'Betting on box office results and award shows',
    avatar: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=200&auto=format&fit=crop',
    inviteCode: 'DEF456',
    members: [
      { userId: 'user1', groupCoins: 1200, joinedAt: new Date().toISOString() },
      { userId: 'user3', groupCoins: 950, joinedAt: new Date().toISOString() },
    ],
    chatMessages: [],
    challenges: [],
    createdBy: '',
    createdAt: ''
  },
];

export const useGroupsStore = create<GroupsState>()(
  persist(
    (set, get) => ({
      groups: mockGroups,
      isLoading: false,
      error: null,
      
      createGroup: async (name, description) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = useAuthStore.getState();
          if (!user) {
            throw new Error('User not authenticated');
          }
          const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          const newGroup: Group = {
            id: `g${Date.now()}`,
            name,
            description,
            avatar: '',
            inviteCode,
            members: [{ userId: user.id, groupCoins: 1000, joinedAt: new Date().toISOString() }],
            chatMessages: [],
            challenges: [],
            createdBy: '',
            createdAt: ''
          };
          set(state => ({
            groups: [...state.groups, newGroup],
            isLoading: false,
          }));
          return newGroup;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to create group' 
          });
          throw error;
        }
      },
      
      joinGroup: async (inviteCode) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = useAuthStore.getState();
          if (!user) {
            throw new Error('User not authenticated');
          }
          const group = get().groups.find(g => g.inviteCode === inviteCode);
          if (!group) {
            throw new Error('Invalid invite code');
          }
          // Si ya es miembro, lanzamos error
          if (group.members.find(m => m.userId === user.id)) {
            throw new Error('You are already a member of this group');
          }
          const updatedGroups = get().groups.map(g => {
            if (g.id === group.id) {
              return {
                ...g,
                members: [
                  ...g.members,
                  { userId: user.id, groupCoins: 1000, joinedAt: new Date().toISOString() }
                ],
              };
            }
            return g;
          });
          set({
            groups: updatedGroups,
            isLoading: false,
          });
          return group;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to join group' 
          });
          throw error;
        }
      },
      
      leaveGroup: async (groupId) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = useAuthStore.getState();
          if (!user) {
            throw new Error('User not authenticated');
          }
          const group = get().groups.find(g => g.id === groupId);
          if (!group) {
            throw new Error('Group not found');
          }
          if (!group.members.find(m => m.userId === user.id)) {
            throw new Error('You are not a member of this group');
          }
          const updatedGroups = get().groups.map(g => {
            if (g.id === groupId) {
              return {
                ...g,
                members: g.members.filter(m => m.userId !== user.id),
              };
            }
            return g;
          });
          set({
            groups: updatedGroups,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to leave group' 
          });
          throw error;
        }
      },
      
      getGroupById: (groupId) => {
        return get().groups.find(g => g.id === groupId);
      },
      
      getUserGroups: (userId) => {
        return get().groups.filter(g => g.members.some(m => m.userId === userId));
      },
      
      getGroupMember: (groupId, userId) => {
        const group = get().getGroupById(groupId);
        if (!group) return undefined;
        return group.members.find(m => m.userId === userId);
      },
      
      updateGroupCoins: (groupId, userId, amount) => {
        set(state => ({
          groups: state.groups.map(g => {
            if (g.id === groupId) {
              return {
                ...g,
                members: g.members.map((m) => {
                  if (m.userId === userId) {
                    return { ...m, groupCoins: m.groupCoins + amount };
                  }
                  return m;
                }),
              };
            }
            return g;
          }),
        }));
      },
      
      getGroupMembersSorted: (groupId) => {
        const group = get().getGroupById(groupId);
        if (!group) return [];
        // Datos simulados de usuarios
        const mockUsers: Record<string, { username: string; avatar: string }> = {
          'user1': { username: 'John Doe', avatar: '' },
          'user2': { username: 'Jane Smith', avatar: '' },
          'user3': { username: 'Mike Johnson', avatar: '' },
        };
        const membersWithData = group.members.map((m) => ({
          userId: m.userId,
          username: mockUsers[m.userId]?.username || 'Unknown User',
          avatar: mockUsers[m.userId]?.avatar || '',
          groupCoins: m.groupCoins,
        }));
        return membersWithData.sort((a, b) => b.groupCoins - a.groupCoins);
      },
      
      addMessage: (groupId, message) => {
        set(state => ({
          groups: state.groups.map(g => {
            if (g.id === groupId) {
              return {
                ...g,
                chatMessages: [...(g.chatMessages || []), message],
              };
            }
            return g;
          }),
        }));
      },
      
      getChatMessages: (groupId) => {
        const group = get().getGroupById(groupId);
        return group?.chatMessages || [];
      },
      
      createChallenge: async (groupId, challenge) => {
        set({ isLoading: true, error: null });
        try {
          const newChallenge: Challenge = {
            ...challenge,
            id: `c${Date.now()}`,
          };
          set(state => ({
            groups: state.groups.map(g => {
              if (g.id === groupId) {
                return {
                  ...g,
                  challenges: [...(g.challenges || []), newChallenge],
                };
              }
              return g;
            }),
            isLoading: false,
          }));
          return newChallenge;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to create challenge' 
          });
          throw error;
        }
      },
      
      getChallenges: (groupId) => {
        const group = get().getGroupById(groupId);
        return group?.challenges || [];
      },
      
      getChallengeById: (groupId, challengeId) => {
        const group = get().getGroupById(groupId);
        if (!group || !group.challenges) return undefined;
        return group.challenges.find(c => c.id === challengeId);
      },
      
      completeChallenge: (groupId, challengeId, userId) => {
        // Actualiza el progreso de la challenge a 100%
        set(state => ({
          groups: state.groups.map(g => {
            if (g.id === groupId && g.challenges) {
              return {
                ...g,
                challenges: g.challenges.map(c => {
                  if (c.id === challengeId) {
                    return {
                      ...c,
                      progress: 100,
                    };
                  }
                  return c;
                }),
              };
            }
            return g;
          }),
        }));
        // Otorga las monedas al usuario
        const challenge = get().getChallengeById(groupId, challengeId);
        if (challenge) {
          const rewardAmount = parseInt(challenge.reward.split(' ')[0]) || 0;
          get().updateGroupCoins(groupId, userId, rewardAmount);
        }
      },
      
      completeTask: (groupId, challengeId, taskId) => {
        set(state => ({
          groups: state.groups.map(g => {
            if (g.id === groupId && g.challenges) {
              return {
                ...g,
                challenges: g.challenges.map(c => {
                  if (c.id === challengeId) {
                    const updatedTasks = c.tasks.map(t => {
                      if (t.id === taskId) {
                        return { ...t, completed: true, progress: t.total };
                      }
                      return t;
                    });
                    const totalTasks = updatedTasks.length;
                    const completedTasks = updatedTasks.filter(t => t.completed).length;
                    const newProgress = Math.round((completedTasks / totalTasks) * 100);
                    return { ...c, tasks: updatedTasks, progress: newProgress };
                  }
                  return c;
                }),
              };
            }
            return g;
          }),
        }));
      },
    }),
    {
      name: 'groups-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
