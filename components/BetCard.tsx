// components/BetCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bet, BetParticipation } from '@/types';

export interface BetCardProps {
  bet: Bet;
  userParticipation: BetParticipation;
  onPress: () => void;
}

// Exportación con nombre (o default si prefieres)
export function BetCard({ bet, userParticipation, onPress }: BetCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{bet.title}</Text>
      <View style={styles.details}>
        <Text style={styles.amount}>Amount: {userParticipation.amount}</Text>
        <Text style={styles.status}>Status: {userParticipation.status}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amount: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  status: {
    fontSize: 14,
    color: '#CCCCCC',
  },
});
