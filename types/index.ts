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

export interface ChallengeParticipation {
  id: string;
  challengeId: string;
  userId: string;
  username?: string;
  avatar?: string;
  blindAmount: number; // Entre 50-100 monedas
  createdAt: string;
}

export interface ChallengeJustification {
  id: string;
  challengeId: string;
  userId: string;
  type: 'text' | 'image' ;
  content: string; // Texto o URL del archivo
  createdAt: string;
  votes?: ChallengeVote[]; // Votos de los miembros
}

export interface ChallengeVote {
  userId: string;
  justificationId: string;
  approved: boolean; // true = aprobado, false = rechazado
  createdAt: string;
}

export interface Challenge {
  id: string;
  groupId: string; // Importante para filtrar por grupo
  title: string;
  description: string;
  initialPrize: number;
  status: 'open' | 'completed' | 'expired';
  winner?: string; // ID del usuario ganador
  endDate: string;
  createdBy: string;
  createdAt: string;
  participants?: ChallengeParticipation[];
  justifications?: ChallengeJustification[];
  totalPrize?: number; // Campo calculado (initial + suma de blinds)
  tasks: ChallengeTask[];
  leaderboard?: ChallengeLeaderboard[];
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
  label: string;     // antes 'text'
  odd: number;       // antes 'odds'
}

export interface Bet {
  id: string;
  groupId: string;
  createdBy: string;
  title: string;
  description: string;
  status: BetStatus;
  endDate?: string;
  createdAt: string;
  // Se llena tras hacer JOIN
  options?: BetOption[];
  // Otros campos calculados (ej. betsCount, pot, etc.) si los deseas

  participations?: any[];
  userParticipation?: BetParticipation;
  settled_option?: string;
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
