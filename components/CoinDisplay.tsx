//components/CinDisplay.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/helpers';

interface CoinDisplayProps {
  // Volvemos 'amount' opcional con '?'
  amount?: number;
  size?: 'small' | 'medium' | 'large';
}

export const CoinDisplay: React.FC<CoinDisplayProps> = ({
  // Si amount no viene, le asignamos 0
  amount = 0,
  size = 'medium',
}) => {
  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 22;
      default:
        return 18;
    }
  };

  const getTextSize = (): number => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 18;
      default:
        return 14;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { fontSize: getTextSize() }]}>
        ${formatCurrency(amount)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    gap: 4,
  },
  text: {
    fontWeight: '600',
    color: colors.text,
  },
});
