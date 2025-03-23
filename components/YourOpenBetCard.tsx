// components/YourOpenBetCard.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Clock, Users, DollarSign } from 'lucide-react-native';

/**
 * Props para la YourOpenBetCard
 */
interface YourOpenBetCardProps {
  bet: any;              // la apuesta completa
  userParticipation: any; // la participación del usuario (objeto con amount, etc)
  groupName: string;     // el nombre del grupo al que pertenece la apuesta
  onPress: () => void;   // callback al tocar la tarjeta
}

export function YourOpenBetCard({
  bet,
  userParticipation,
  groupName,
  onPress,
}: YourOpenBetCardProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  // 1. Calcular pot total
  const totalPot = useMemo(() => {
    if (!bet.participations) return 0;
    return bet.participations.reduce((sum: number, p: any) => sum + p.amount, 0);
  }, [bet.participations]);

  // 2. Calcular tiempo restante
  const timeLeftStr = useMemo(() => {
    if (!bet.end_date) return t('noEndDate') || 'No end date';
    const now = Date.now();
    const endTime = new Date(bet.end_date).getTime();
    const diff = endTime - now;
    if (diff <= 0) return t('ended') || 'Ended';

    let seconds = Math.floor(diff / 1000);
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);

    let result = '';
    if (days) result += `${days}d `;
    if (hours) result += `${hours}h `;
    if (minutes) result += `${minutes}m `;
    if (!result) result = '<1m ';
    //result += t('remaining') || 'remaining';
    return result.trim();
  }, [bet.end_date, t]);

  // 3. Estado en la parte superior derecha
  const statusLabel = bet.status || 'open'; // o lo que sea
  // Puedes cambiar los colores según tu preferencia
  const statusColor = statusLabel === 'open' ? '#4CAF50' : '#9E9E9E';

  // 4. Participantes
  const participantsCount = bet.participations?.length || 0;

  // 5. Apuesta del usuario
  const userBetAmount = userParticipation?.amount || 0;

  // 6. Progreso (opcional) - basado en tiempo transcurrido vs. total
  // (Si no deseas un progress bar, puedes omitirlo)
  const progress = useMemo(() => {
    if (!bet.created_at || !bet.end_date) return 0;
    const start = new Date(bet.created_at).getTime();
    const end = new Date(bet.end_date).getTime();
    const now = Date.now();
    if (now >= end) return 1;
    if (now <= start) return 0;
    return (now - start) / (end - start);
  }, [bet.created_at, bet.end_date]);

  const progressWidth = `${Math.min(100, Math.floor(progress * 100))}%`;

  return (
    <TouchableOpacity
      style={[styles.cardContainer, { backgroundColor: colors.card }]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* Nombre del grupo y estado */}
      <View style={styles.headerRow}>
        <View style={[styles.pill, { backgroundColor: colors.background }]}>
          <Text style={[styles.pillText, { color: colors.text }]}>
            {groupName}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
          <Text style={styles.statusPillText}>{statusLabel}</Text>
        </View>
      </View>

      {/* Título y descripción */}
      <Text style={[styles.betTitle, { color: colors.text }]} numberOfLines={2}>
        {bet.title}
      </Text>
      {bet.description ? (
        <Text style={[styles.betDescription, { color: colors.textSecondary }]}>
          {bet.description}
        </Text>
      ) : null}

      {/* Fila con info: tu apuesta, total pot, participantes */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            {t('yourBet') || 'Your bet'}:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            ${userBetAmount}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            {t('totalPot') || 'Total pot'}:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            ${totalPot}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            {t('participants') || 'Participants'}:
          </Text>
          <View style={styles.infoValueRow}>
            <Users size={14} color={colors.text} style={{ marginRight: 4 }} />
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {participantsCount}
            </Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <Clock size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {timeLeftStr}
          </Text>
        </View>
      </View>

      {/* Barra de progreso (opcional) */}
      <View style={[styles.progressBarContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.progressBarFill, { width: progressWidth }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 300,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    // shadow, etc.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusPill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  betTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  betDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#4CAF50',
  },
});
