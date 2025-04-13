// components/ChallengeCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, Users, Trophy, Calendar } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Challenge } from '@/types';

interface ChallengeCardProps {
  challenge: Challenge;
  onPress: () => void;
}

// Función para calcular cuántos días faltan
function getDaysLeft(dueDate: Date): number {
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onPress }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const dueDate = new Date(challenge.end_date);
  const daysLeft = getDaysLeft(dueDate);
  const isExpired = daysLeft <= 0;
  const totalPrize = challenge.totalPrize || challenge.initialPrize || 0;
  const participantsCount = challenge.participants?.length || 0;

  // Determina el texto y color según el estado del desafío
  let statusInfo = {
    text: '',
    color: colors.textSecondary
  };

  if (challenge.status === 'completed') {
    statusInfo = {
      text: t('completed') || 'Completed',
      color: colors.success
    };
  } else if (isExpired) {
    statusInfo = {
      text: t('expired') || 'Expired',
      color: colors.error
    };
  } else {
    statusInfo = {
      text: `${daysLeft} ${t('daysLeft') || 'days left'}`,
      color: daysLeft <= 3 ? colors.warning : colors.textSecondary
    };
  }

  // Determinar estado del botón
  const isButtonDisabled = challenge.status !== 'open' || isExpired;
  const buttonOpacity = isButtonDisabled ? 0.6 : 1;

  return (
    <View style={[
      styles.cardContainer, 
      { 
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2
      }
    ]}>
      {/* Encabezado */}
      <View style={styles.headerRow}>
        <View style={styles.leftHeader}>
          <View style={[styles.statusIndicator, { backgroundColor: `${statusInfo.color}20` }]}>
            <Calendar size={14} color={statusInfo.color} style={styles.statusIcon} />
            <Text style={[styles.daysLeft, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>
        <View style={styles.rightHeader}>
          {challenge.status === 'open' && (
            <View style={[styles.statusBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.statusBadgeText, { color: colors.textInverted }]}>
                {t('open') || 'Open'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Contenido principal: título y descripción */}
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {challenge.title}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>
        {challenge.description}
      </Text>

      {/* Fila de coins y participantes */}
      <View style={styles.infoRow}>
        <View style={styles.prizeContainer}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.coin}15` }]}>
            <Trophy size={14} color={colors.coin} />
          </View>
          <Text style={[styles.coinsText, { color: colors.coin }]}>
            {totalPrize} {t('coins') || 'coins'}
          </Text>
        </View>
        <View style={styles.participantsContainer}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <Users size={14} color={colors.primary} />
          </View>
          <Text style={[styles.participantsText, { color: colors.textSecondary }]}>
            {participantsCount} {t('participants') || 'participants'}
          </Text>
        </View>
      </View>

      {/* Botón principal */}
      <TouchableOpacity
        style={[
          styles.button, 
          { 
            backgroundColor: colors.primary,
            opacity: buttonOpacity,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: isButtonDisabled ? 0 : 2
          }
        ]}
        onPress={onPress}
        disabled={isButtonDisabled}
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  rightHeader: {},
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  daysLeft: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  prizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinsText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantsText: {
    fontSize: 13,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 15,
  },
});
