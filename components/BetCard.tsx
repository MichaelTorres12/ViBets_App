// components/BetCard.tsx
import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { Clock, Users, DollarSign, Trophy } from 'lucide-react-native';
import { useLanguage } from '@/components/LanguageContext';

export interface BetOption {
  id: string;
  label: string; // Corresponde a option_text en la DB
  odd: number;   // Corresponde a odds en la DB
}

export interface Bet {
  id: string;
  title: string;
  description?: string;
  status?: string;       // 'open', 'closed', 'settled'
  options?: BetOption[]; // Se espera que venga mapeado desde el JOIN de bet_options
  betsCount?: number;
  pot?: number;
  end_date?: string;     // Fecha/hora final
  // Se asume que también viene la propiedad participations
  participations?: any[];
  settled_option?: string;
}

interface BetCardProps {
  bet: Bet;
  userParticipation: any;
  onPress: () => void;
}

export const BetCard: React.FC<BetCardProps> = ({ bet, userParticipation, onPress }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  // Consola para revisar la data de la apuesta
  useEffect(() => {
    console.log("BetCard - Datos de la apuesta:", bet);
  }, [bet]);

  // 1. Calcular tiempo restante usando traducciones para "Ended" y "left"
  const { timeLeft, isEnded } = useMemo(() => {
    if (!bet.end_date) {
      return { timeLeft: t('noEndDate') || 'No end date', isEnded: false };
    }
    const now = Date.now();
    const endTime = new Date(bet.end_date).getTime();
    const diff = endTime - now;

    if (diff <= 0) {
      return { timeLeft: t('ended') || 'Ended', isEnded: true };
    }

    let seconds = Math.floor(diff / 1000);
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);

    const dStr = days ? `${days}d ` : '';
    const hStr = hours ? `${hours}h ` : '';
    const mStr = minutes ? `${minutes}m ` : '';
    return { timeLeft: `${dStr}${hStr}${mStr}${t('left') || 'left'}`.trim(), isEnded: false };
  }, [bet.end_date, t]);

  // 2. Ajustar el status local según expiración
  const localStatus = useMemo(() => {
    if (bet.status === 'open' && isEnded) {
      return 'closed';
    }
    return bet.status ?? 'unknown';
  }, [bet.status, isEnded]);

  // 3. Obtener badge y color según el status
  const { label: statusLabel, bgColor: statusColor } = getStatusBadge(localStatus);

  // 4. Datos adicionales de la apuesta
  // Calculamos la cantidad de participantes a partir del array de participations.
  const participantsCount = bet.participations ? bet.participations.length : 0;
  // Calculamos el pot como la sumatoria de todas las amounts de las participaciones.
  const computedPot = bet.participations
    ? bet.participations.reduce((total, part) => total + part.amount, 0)
    : 0;
    
  // Make sure we properly map the options array - this is the key change
  const options = useMemo(() => {
    if (!bet.options) return [];
    
    // If options are already in the correct format, return them
    if (bet.options.length > 0 && 'label' in bet.options[0] && 'odd' in bet.options[0]) {
      return bet.options;
    }
    
    // If options are in the raw database format (bet_options), map them
    if (bet.bet_options && Array.isArray(bet.bet_options)) {
      return bet.bet_options.map(opt => ({
        id: opt.id,
        label: opt.option_text,
        odd: parseFloat(opt.odds || 0)
      }));
    }
    
    // Log the issue for debugging
    console.log("BetCard - Could not parse options:", bet.options);
    return [];
  }, [bet.options, bet.bet_options]);

  // Consola para revisar las opciones obtenidas
  useEffect(() => {
    console.log("BetCard - Opciones de la apuesta procesadas:", options);
  }, [options]);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Header: Título y estado */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {bet.title}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={[styles.statusBadgeText, { color: statusColor === '#FFD60A' ? '#000' : '#fff' }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* Descripción */}
      {bet.description && (
        <Text style={[styles.description, { color: colors.textSecondary }]}>{bet.description}</Text>
      )}

      {/* Opciones de apuesta */}
      {options.length > 0 && (
        <View style={styles.optionsContainer}>
          {options.map((option, idx) => (
            <View key={option.id || idx}>
              <View style={styles.optionRow}>
                <Text style={[styles.optionLabel, { color: colors.text }]}>{option.label}</Text>
                <Text style={[styles.optionOdd, { color: colors.primary }]}>{(option.odd || 0).toFixed(2)}</Text>
              </View>
              {idx < options.length - 1 && (
                <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
              )}
            </View>
          ))}
        </View>
      )}

      {/* Footer: Tiempo restante, número de bets (participantes) y pozo */}
      <View style={styles.footerRow}>
        <View style={styles.footerItemRow}>
          <Clock size={14} color={colors.textSecondary} style={styles.footerIcon} />
          <Text style={[styles.footerItemText, { color: colors.textSecondary }]}>{timeLeft}</Text>
        </View>
        <View style={styles.footerItemRow}>
          <Users size={14} color={colors.textSecondary} style={styles.footerIcon} />
          <Text style={[styles.footerItemText, { fontWeight: 'bold', color: '#fff' }]}>
            {participantsCount}{' '}
          </Text>
          <Text style={[styles.footerItemText, { color: colors.textSecondary }]}>
            {t('bets')}
          </Text>
        </View>
        <View style={styles.footerItemRow}>
          <Text style={[styles.footerItemText, { color: colors.textSecondary }]}>
            {t('pot')}{'  '}
          </Text>
          <Text style={[styles.footerItemText, { fontWeight: 'bold', color: '#fff' }]}>
            ${computedPot}
          </Text>
        </View>
      </View>

      {/* Añadir indicador de ganador */}
      {bet.status === 'settled' && bet.settled_option && userParticipation?.id === bet.settled_option && (
        <View style={[styles.winnerBadge, { backgroundColor: colors.success }]}>
          <Trophy size={14} color="white" />
          <Text style={styles.winnerBadgeText}>{t('winner') || 'Winner'}</Text>
        </View>
      )}

      {/* Indicador si el usuario ganó o perdió (para apuestas resueltas) */}
      {bet.status === 'settled' && bet.settled_option && userParticipation && (
        <View style={[
          styles.resultBadge, 
          { 
            backgroundColor: userParticipation.option_id === bet.settled_option || 
                            userParticipation.optionId === bet.settled_option
              ?`${colors.success}99`
              : colors.error 
          }
        ]}>
          <Text style={styles.resultBadgeText}>
            {userParticipation.option_id === bet.settled_option || 
             userParticipation.optionId === bet.settled_option
              ? t('youWon') || 'You Won!' 
              : t('youLost') || 'You Lost!'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

/** Función que retorna el label y color del badge según el status */
function getStatusBadge(status: string) {
  const { t } = useLanguage();
  switch (status) {
    case 'open':
      return { label: t('open'), bgColor: '#FFD60A', color: '#000' };
    case 'closed':
      return { label: t('closed'), bgColor: '#F44336', color: '#fff' };
    case 'settled':
      return { label: t('settled'), bgColor: '#9E9E9E', color: '#fff' };
    default:
      return { label: t('unknown'), bgColor: '#777', color: '#fff' };
  }
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  optionOdd: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    marginRight: 4,
  },
  footerItemText: {
    fontSize: 13,
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  winnerBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultBadge: {
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  resultBadgeText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#fff',
  },
});
