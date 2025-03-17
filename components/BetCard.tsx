// components/BetCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/components/ThemeContext';

interface BetCardProps {
  bet: any; // Puedes definir un tipo específico para la apuesta
  userParticipation: any; // Define el tipo según tu modelo; aquí se asume que tiene la propiedad 'amount'
  onPress: () => void;
}

export const BetCard: React.FC<BetCardProps> = ({ bet, userParticipation, onPress }) => {
  const { colors } = useTheme();

  // Si userParticipation es null, usamos un valor por defecto (por ejemplo, 0)
  const participationAmount = userParticipation ? userParticipation.amount : 0;

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={onPress}>
      <Text style={[styles.title, { color: colors.text }]}>{bet.title}</Text>
      {bet.description && (
        <Text style={[styles.description, { color: colors.textSecondary }]}>{bet.description}</Text>
      )}
      <Text style={{ color: colors.text }}>
        Participación: {participationAmount}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginVertical: 4,
  },
});
