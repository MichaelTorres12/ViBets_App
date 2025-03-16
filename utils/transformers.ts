import { Bet, BetOption, BetParticipation } from '@/types';

export const transformBet = (data: any): Bet => {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    groupId: data.group_id,
    createdBy: data.created_by,
    createdAt: data.created_at,
    expiresAt: data.expires_at,
    endDate: data.end_date,
    options: data.options ? data.options.map(transformBetOption) : [],
    status: data.status, // Por ejemplo, 'open', 'closed' o 'settled'
    settledOption: data.settled_option, // Usamos settledOption en lugar de winningOptionId
    type: data.type,
  };
};

export const transformBetOption = (data: any): BetOption => {
  return {
    id: data.id,
    text: data.text,
    name: data.name,
    odds: Number(data.odds),
    betId: data.bet_id, // Se agrega esta propiedad para cumplir con el tipo BetOption
  };
};

export const transformBetParticipation = (data: any): BetParticipation => {
  return {
    id: data.id,
    betId: data.bet_id,
    userId: data.user_id,
    optionId: data.option_id,
    amount: data.amount,
    createdAt: data.created_at,
    // Forzamos el type para que sea uno de los permitidos:
    status: data.status as 'active' | 'won' | 'lost',
  };
};
