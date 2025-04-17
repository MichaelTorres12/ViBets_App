// types/index.tsx
import { ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/*                                USERS                               */
/* ------------------------------------------------------------------ */
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  coins: number;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*                                GROUPS                              */
/* ------------------------------------------------------------------ */
export interface GroupMember {
  userId: string;
  username?: string;
  groupCoins: number;
  joinedAt: string;
}

export interface ChatMessage {
  id?: string;
  group_id?: string;
  sender: string | null; // null → sistema
  username: string;
  message: string;
  image?: string | null;
  timestamp: string;
  is_system?: boolean;
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

/* ------------------------------------------------------------------ */
/*                               CHALLENGES                           */
/* ------------------------------------------------------------------ */
export type ChallengeStatus = 'open' | 'completed' | 'expired';

export interface ChallengeParticipation {
  id: string;
  challengeId: string;
  userId: string;
  username?: string;
  avatar?: string;
  blindAmount: number;
  status: 'active' | 'won' | 'lost';
  createdAt: string;
}

export interface ChallengeVote {
  userId: string;
  justificationId: string;
  approved: boolean;
  createdAt: string;
}

export interface ChallengeJustification {
  id: string;
  challengeId: string;
  userId: string;
  type: 'text' | 'image';
  content: string;
  createdAt: string;
  votes?: ChallengeVote[];
}

export interface Challenge {
  id: string;
  groupId: string;
  title: string;
  description: string;
  initialPrize: number;
  finalPrize?: number;
  status: ChallengeStatus;
  winner?: string;
  endDate: string;
  settledAt?: string;
  createdBy: string;
  createdAt: string;
  participants?: ChallengeParticipation[];
  justifications?: ChallengeJustification[];
  totalPrize?: number;
}

/* ------------------------------------------------------------------ */
/*                                 BETS                               */
/* ------------------------------------------------------------------ */
export type BetStatus = 'open' | 'closed' | 'settled';
export type ParticipationStatus = 'active' | 'won' | 'lost';

export interface BetOption {
  id: string;
  betId: string;
  text: string;
  label: string;
  odd: number;
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

export interface Bet {
  id: string;
  groupId: string;
  createdBy: string;
  title: string;
  description: string;
  status: BetStatus;
  endDate?: string;
  createdAt: string;
  options?: BetOption[];
  participations?: BetParticipation[];
  userParticipation?: BetParticipation;
  settled_option?: string;
}
