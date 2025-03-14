//types/index.tsx
import { ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  coins: number; // Global coins (real money $1 = 1 coin)
  createdAt: string;
}

export interface GroupMember {
  userId: string;
  groupCoins: number; // Group-specific coins
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  avatar?: string;
  message?: string;
  image?: string;
  timestamp: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  endDate: string;
  createdBy: string;
  createdAt: string;
  tasks: ChallengeTask[];
  leaderboard?: ChallengeLeaderboard[];
  participants?: ChallengeParticipant[];
  completedBy?: ChallengeCompleted[];
}

export interface ChallengeTask {
  id: string;
  description: string;
  progress: number;
  total: number;
  reward: string;
  completed?: boolean;
}

export interface ChallengeLeaderboard {
  rank: number;
  name: string;
  wins: number;
  avatar: string;
}

export interface ChallengeParticipant {
  name: string;
  currentStreak: number;
  bestStreak: number;
  avatar: string;
}

export interface ChallengeCompleted {
  name: string;
  date: string;
  betAmount: number;
  avatar: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  createdBy: string;
  members: GroupMember[];
  createdAt: string;
  inviteCode: string;
  chatMessages?: ChatMessage[];
  challenges?: Challenge[];
}

export interface BetOption {
  text: ReactNode;
  id: string;
  name: string;
  odds: number;
}

export type BetType = 'binary' | 'multiple' | 'custom';

export interface Bet {
  endDate: string | number | Date;
  id: string;
  title: string;
  description?: string;
  groupId: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  options: BetOption[];
  status: 'open' | 'closed' | 'settled';
  winningOptionId?: string;
  type: BetType;
  // Agregar la propiedad settledOption como opcional:
  settledOption?: string;
}

export interface BetParticipation {
  id: string;
  betId: string;
  userId: string;
  optionId: string;
  amount: number;
  createdAt: string;
  status: 'active' | 'won' | 'lost';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}