// components/ChallengeCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, Users, Trophy } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Challenge } from '@/types';

interface ChallengeCardProps {
  challenge: Challenge;
  onPress: () => void;
}

function getDaysLeft(dueDate: Date): number {
  const diff = dueDate.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 3600 * 24));
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onPress,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const due = new Date(challenge.endDate);
  const daysLeft = getDaysLeft(due);

  /* ---------------------------- STATUS & COLOR --------------------------- */
  let statusInfo = { text: '', color: colors.textSecondary };

  switch (challenge.status) {
    case 'completed':
      statusInfo = { text: t('completed') || 'Completed', color: colors.success };
      break;
    case 'expired':
      statusInfo = { text: t('expired') || 'Expired', color: colors.error };
      break;
    default: {
      statusInfo = {
        text: `${daysLeft} ${t('daysLeft') || 'days left'}`,
        color: daysLeft <= 3 ? colors.warning : colors.textSecondary,
      };
    }
  }

  /* ------------------------ PRIZE & PARTICIPANTS ------------------------- */
  const totalPrize =
    challenge.finalPrize ?? challenge.totalPrize ?? challenge.initialPrize ?? 0;
  const participantsCount = challenge.participants?.length ?? 0;

  const buttonDisabled = false;

  /* ---------------------------------------------------------------------- */
  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: '#000',
        },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.leftHeader}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: `${statusInfo.color}20` },
            ]}
          >
            <Calendar size={14} color={statusInfo.color} style={styles.icon} />
            <Text style={[styles.daysLeft, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>
        {challenge.status === 'open' && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.textInverted }]}>
              {t('open') || 'Open'}
            </Text>
          </View>
        )}
      </View>

      {/* Title & description */}
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {challenge.title}
      </Text>
      <Text
        style={[styles.subtitle, { color: colors.textSecondary }]}
        numberOfLines={2}
      >
        {challenge.description}
      </Text>

      {/* Info */}
      <View style={styles.infoRow}>
        {/* Prize */}
        <View style={styles.prizeContainer}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: `${colors.coin}15` },
            ]}
          >
            <Trophy size={14} color={colors.coin} />
          </View>
          <Text style={[styles.coinsText, { color: colors.coin }]}>
            {totalPrize} {t('coins') || 'coins'}
          </Text>
        </View>

        {/* Participants */}
        <View style={styles.participantsContainer}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: `${colors.primary}15` },
            ]}
          >
            <Users size={14} color={colors.primary} />
          </View>
          <Text style={[styles.participantsText, { color: colors.textSecondary }]}>
            {participantsCount} {t('participants') || 'participants'}
          </Text>
        </View>
      </View>

      {/* Button */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
            opacity: challenge.status === 'open' ? 1 : 0.6,
          },
        ]}
        disabled={buttonDisabled}
        onPress={onPress}
      >
        <Text style={[styles.buttonText, { color: colors.textInverted }]}>
          {t('viewChallenge') || 'View Challenge'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  leftHeader: { flexDirection: 'row', alignItems: 'center' },
  statusIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  icon: { marginRight: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  daysLeft: { fontSize: 12, fontWeight: '600' },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 16, lineHeight: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  prizeContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconCircle: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  coinsText: { fontWeight: 'bold', fontSize: 15 },
  participantsContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  participantsText: { fontSize: 13 },
  button: { borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  buttonText: { fontWeight: '600', fontSize: 15 },
});
