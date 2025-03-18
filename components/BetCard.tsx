import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/components/ThemeContext';

interface BetOption {
  label: string;
  odd: number;
}

interface Bet {
  id: string;
  title: string;
  description?: string;
  status?: string;       // 'open', 'closed', 'settled'
  options?: BetOption[];
  betsCount?: number;
  pot?: number;
  end_date?: string;     // Fecha/hora final de la apuesta (ISO)
}

interface BetCardProps {
  bet: Bet;
  userParticipation: any; 
  onPress: () => void;
}

export const BetCard: React.FC<BetCardProps> = ({ bet, userParticipation, onPress }) => {
  const { colors } = useTheme();
  
  // Cálculo del tiempo restante
  const { timeLeft, isEnded } = useMemo(() => {
    if (!bet.end_date) {
      return { timeLeft: 'No end date', isEnded: false };
    }

    const now = Date.now();
    const endTime = new Date(bet.end_date).getTime();
    const diff = endTime - now;

    if (diff <= 0) {
      // El tiempo ya expiró
      return { timeLeft: 'Ended', isEnded: true };
    }
    
    // Convertir milisegundos a d/h/m
    let seconds = Math.floor(diff / 1000);
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);

    const dStr = days > 0 ? `${days}d ` : '';
    const hStr = hours > 0 ? `${hours}h ` : '';
    const mStr = minutes > 0 ? `${minutes}m ` : '';
    return { timeLeft: `${dStr}${hStr}${mStr}left`.trim(), isEnded: false };
  }, [bet.end_date]);

  // Override local del status:
  // Si status es 'open' y ya expiró, lo tratamos como 'closed' para la UI
  const localStatus = useMemo(() => {
    if (bet.status === 'open' && isEnded) {
      return 'closed';
    }
    return bet.status ?? 'unknown';
  }, [bet.status, isEnded]);

  // Decidir color y texto del badge
  function getStatusBadge(status: string) {
    switch (status) {
      case 'open':
        return { label: 'Open', bgColor: '#4CAF50' };   // Verde
      case 'closed':
        return { label: 'Closed', bgColor: '#F44336' }; // Rojo
      case 'settled':
        return { label: 'Settled', bgColor: '#9E9E9E' };
      default:
        return { label: 'Unknown', bgColor: '#777' };
    }
  }
  const { label: statusLabel, bgColor: statusColor } = getStatusBadge(localStatus);

  const participationAmount = userParticipation?.amount ?? 0;
  const betsCount = bet.betsCount ?? 0;
  const pot = bet.pot ?? 0;

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Header: Título y badge de estado */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {bet.title}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusBadgeText}>{statusLabel}</Text>
        </View>
      </View>

      {/* Descripción */}
      {bet.description && (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {bet.description}
        </Text>
      )}

      {/* Opciones */}
      {bet.options && bet.options.length > 0 && (
        <View style={styles.optionsContainer}>
          {bet.options.map((option, idx) => (
            <View key={idx} style={styles.optionRow}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>
                {option.label}
              </Text>
              <Text style={[styles.optionOdd, { color: '#FFD60A' }]}>
                {option.odd.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footerRow}>
        <Text style={[styles.footerItem, { color: colors.textSecondary }]}>
          {timeLeft}
        </Text>
        <Text style={[styles.footerItem, { color: colors.textSecondary }]}>
          {betsCount} bets
        </Text>
        <Text style={[styles.footerItem, { color: colors.textSecondary }]}>
          Pot ${pot}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    maxWidth: '80%',
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  optionsContainer: {
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionOdd: {
    fontSize: 14,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    marginTop: 4,
    justifyContent: 'space-between',
  },
  footerItem: {
    fontSize: 12,
  },
});
