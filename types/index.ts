// types/index.tsx
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
  username?: string;  // Make it optional in case we can't fetch the username
  groupCoins: number;
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
  bets?: Bet[];
}

export type BetType = 'binary' | 'multiple' | 'custom';
export type BetStatus = 'open' | 'closed' | 'settled';
export type ParticipationStatus = 'active' | 'won' | 'lost';

export interface BetOption {
  id: string;
  betId: string;
  text: string;
  name: string;
  odds: number;
}

export interface Bet {
  id: string;
  title: string;
  description?: string;
  groupId: string;
  createdBy: string;
  type: BetType;
  options: BetOption[];
  endDate: string;
  status: BetStatus;
  settledOption?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface BetParticipation {
  id: string;
  betId: string;
  userId: string;
  optionId: string;
  amount: number;
  status: ParticipationStatus;
  createdAt: string;
}
