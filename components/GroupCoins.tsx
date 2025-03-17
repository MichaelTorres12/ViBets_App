import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { Coins } from 'lucide-react-native';

interface GroupCoinsProps {
  amount: number;
}

export function GroupCoins({ amount }: GroupCoinsProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.text, { color: colors.text }]}>Your Group Coins:</Text>
      <View style={[styles.containerCoins, { backgroundColor: colors.card }]}>
      <Coins size={24} color={colors.primary} />
      <Text style={[styles.amount, { color: colors.text }]}>
        {amount.toLocaleString()}
      </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  containerCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 