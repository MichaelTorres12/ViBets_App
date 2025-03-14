// store/bets-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bet, BetParticipation, BetType } from '@/types';
import { useAuthStore } from './auth-store';

// Nota: No importamos BetStatus porque en el type Bet ya se define el status como:
// status: 'open' | 'closed' | 'settled';

interface BetsState {
  bets: Bet[];
  participations: BetParticipation[];
  isLoading: boolean;
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
  placeBet: (betId: string, optionId: string, amount: number) => Promise<BetParticipation>;
  settleBet: (betId: string, winningOptionId: string) => Promise<void>;
  getGroupBets: (groupId: string) => Bet[];
  getUserBets: (userId: string) => BetParticipation[];
  getBetById: (id: string) => Bet | undefined;
  getBetParticipations: (betId: string) => BetParticipation[];
  getUserParticipationInBet: (betId: string, userId: string) => BetParticipation | undefined;
}

// Mock bets para demostración
const mockBets: Bet[] = [
  {
    id: '1',
    title: 'Who will win the game tonight?',
    description: 'Lakers vs Warriors',
    groupId: '1',
    createdBy: '1',
    type: 'binary',
    options: [
      { id: '1-1', text: 'Lakers', name: 'Lakers', odds: 0 },
      { id: '1-2', text: 'Warriors', name: 'Warriors', odds: 0 },
    ],
    endDate: new Date(Date.now() + 86400000).toISOString(), // 24 horas después
    status: 'open',
    createdAt: new Date().toISOString(),
    expiresAt: ''
  },
  {
    id: '2',
    title: 'Movie rating prediction',
    description: 'What will be the Rotten Tomatoes score for the new Marvel movie?',
    groupId: '2',
    createdBy: '2',
    type: 'multiple',
    options: [
      { id: '2-1', text: 'Below 60%', name: 'Below 60%', odds: 40 },
      { id: '2-2', text: '60% - 75%', name: '60% - 75%', odds: 40 },
      { id: '2-3', text: '76% - 90%', name: '76% - 90%', odds: 10 },
      { id: '2-4', text: 'Above 90%', name: 'Above 90%', odds: 10 },
    ],
    endDate: new Date(Date.now() + 604800000).toISOString(), // 7 días después
    status: 'open',
    createdAt: new Date().toISOString(),
    expiresAt: ''
  },
];

// Mock participations
const mockParticipations: BetParticipation[] = [
  {
    id: '1',
    betId: '1',
    userId: '1',
    optionId: '1-1',
    amount: 100,
    createdAt: new Date().toISOString(),
    status: 'active',
  },
  {
    id: '2',
    betId: '1',
    userId: '2',
    optionId: '1-2',
    amount: 150,
    createdAt: new Date().toISOString(),
    status: 'active',
  },
];

export const useBetsStore = create<BetsState>()(
  persist(
    (set, get) => ({
      bets: mockBets,
      participations: mockParticipations,
      isLoading: false,
      
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
        set({ isLoading: true });
        try {
          // Simula llamada API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newBet: Bet = {
            id: String(get().bets.length + 1),
            title,
            description,
            groupId,
            createdBy: '1', // Suponemos que el usuario actual tiene ID "1"
            type,
            options: options.map((opt, index) => ({
              id: `${get().bets.length + 1}-${index + 1}`,
              text: opt.text,         // Se asigna la propiedad text
              name: opt.text,         // Se asigna el mismo valor a name
              odds: opt.odds ?? 1,     // Si odds es undefined, se usa 1 por defecto
            })),
            endDate,
            status: 'open',
            createdAt: new Date().toISOString(),
            expiresAt: ''
          };
          
          set(state => ({ 
            bets: [...state.bets, newBet],
            isLoading: false 
          }));
          
          return newBet;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      placeBet: async (betId, optionId, amount) => {
        set({ isLoading: true });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const bet = get().bets.find(b => b.id === betId);
          if (!bet) {
            throw new Error('Bet not found');
          }
          if (bet.status !== 'open') {
            throw new Error('This bet is no longer accepting participations');
          }
          const existingParticipation = get().participations.find(
            p => p.betId === betId && p.userId === '1' // Suponemos que el usuario actual tiene ID "1"
          );
          if (existingParticipation) {
            throw new Error('You have already placed a bet on this event');
          }
          const user = useAuthStore.getState().user;
          if (!user || user.coins < amount) {
            throw new Error('Not enough coins');
          }
          useAuthStore.getState().updateCoins(-amount);
          const newParticipation: BetParticipation = {
            id: String(get().participations.length + 1),
            betId,
            userId: '1',
            optionId,
            amount,
            createdAt: new Date().toISOString(),
            status: 'active',
          };
          set(state => ({ 
            participations: [...state.participations, newParticipation],
            isLoading: false 
          }));
          return newParticipation;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      settleBet: async (betId, winningOptionId) => {
        set({ isLoading: true });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const betIndex = get().bets.findIndex(b => b.id === betId);
          if (betIndex === -1) {
            throw new Error('Bet not found');
          }
          const bet = get().bets[betIndex];
          if (bet.status !== 'open') {
            throw new Error('This bet has already been settled');
          }
          const updatedBet: Bet = {
            ...bet,
            status: 'settled', // Literal "settled"
            settledOption: winningOptionId,
          };
          const betParticipations = get().participations.filter(p => p.betId === betId);
          const totalPot = betParticipations.reduce((sum, p) => sum + p.amount, 0);
          const winningPot = betParticipations
            .filter(p => p.optionId === winningOptionId)
            .reduce((sum, p) => sum + p.amount, 0);
          const updatedParticipations: BetParticipation[] = get().participations.map(p => {
            if (p.betId === betId) {
              if (p.optionId === winningOptionId) {
                const winRatio = p.amount / winningPot;
                const winnings = Math.floor(totalPot * winRatio);
                if (p.userId === '1') {
                  useAuthStore.getState().updateCoins(winnings);
                }
                return { ...p, status: 'won' };
              } else {
                return { ...p, status: 'lost' };
              }
            }
            return p;
          });
          set((state) => ({
            bets: state.bets.map(b => b.id === updatedBet.id ? updatedBet : b),
            participations: updatedParticipations,
            isLoading: false,
          }) as Partial<BetsState>);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      getGroupBets: (groupId) => {
        return get().bets.filter(b => b.groupId === groupId);
      },
      
      getUserBets: (userId) => {
        return get().participations.filter(p => p.userId === userId);
      },
      
      getBetById: (id) => {
        return get().bets.find(b => b.id === id);
      },
      
      getBetParticipations: (betId) => {
        return get().participations.filter(p => p.betId === betId);
      },
      
      getUserParticipationInBet: (betId, userId) => {
        return get().participations.find(p => p.betId === betId && p.userId === userId);
      },
    }),
    {
      name: 'bets-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
