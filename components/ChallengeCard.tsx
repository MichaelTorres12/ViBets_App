// components/ChallengeCard.tsx
// components/ChallengeCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, Users, Trophy } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Challenge } from '@/types';

interface ChallengeCardProps {
  challenge: Challenge;
  onPress: () => void;         // Acción al presionar el botón "View Challenge"
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
  const isExpired = daysLeft <= 0; // Si ya pasó la fecha
  const totalPrize = challenge.totalPrize || challenge.initialPrize || 0;
  const participantsCount = challenge.participants?.length || 0;

  // Determina el texto a mostrar en la esquina superior derecha
  let topRightText = '';
  if (challenge.status === 'completed') {
    topRightText = t('completed') || 'Completed';
  } else if (isExpired) {
    topRightText = t('expired') || 'Expired';
  } else {
    topRightText = `${daysLeft} ${t('daysLeft') || 'days left'}`;
  }

  return (
    <View style={styles.cardContainer}>
      {/* Encabezado */}
      <View style={styles.headerRow}>
        <View style={styles.leftHeader}>
          {/* Aquí podrías mostrar el nombre del creador, avatar, etc. si lo deseas */}
          {/* <Text style={styles.creatorName}>Alex</Text> */}
        </View>
        <View style={styles.rightHeader}>
          <Text style={styles.daysLeft}>{topRightText}</Text>
        </View>
      </View>

      {/* Contenido principal: título y descripción */}
      <Text style={styles.title} numberOfLines={2}>
        {challenge.title}
      </Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {challenge.description}
      </Text>

      {/* Fila de coins y participantes */}
      <View style={styles.infoRow}>
        <View style={styles.prizeContainer  }>
          <Trophy size={14} color="#888" />
          <Text style={styles.coinsText}>
            {totalPrize} {t('coins') || 'coins'}
          </Text>
        </View>
        <View style={styles.participantsContainer}>
          <Users size={14} color="#888" />
          <Text style={styles.participantsText}>
            {participantsCount} {t('participants') || 'participants'}
          </Text>
        </View>
      </View>

      {/* Botón principal */}
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        disabled={challenge.status !== 'open' || isExpired}
      >
        <Text style={styles.buttonText}>
          {t('viewChallenge') || 'View Challenge'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1E1E1E', // Fondo oscuro
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  leftHeader: {
    // espacio para avatar o nombre de creador
  },
  rightHeader: {},
  daysLeft: {
    color: '#AAA',       // Texto gris
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#BDBDBD',
    fontSize: 14,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  coinsText: {
    color: '#FFD60A', // Amarillo
    fontWeight: 'bold',
    fontSize: 16,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    color: '#BDBDBD',
    marginLeft: 4,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#FFD60A', // mismo amarillo que newChallenge
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 15,
  },
  prizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
