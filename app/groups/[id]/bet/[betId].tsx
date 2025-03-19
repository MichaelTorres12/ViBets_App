// app/groups/[id]/bet/[betId].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { useBetsStore } from '@/store/bets-store';
import { useGroupsStore } from '@/store/groups-store';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { ArrowLeft, Trophy, Users, DollarSign, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const formatDate = (date: Date): string => date.toLocaleDateString();

export default function BetDetailScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const { id, betId } = useLocalSearchParams<{ id: string; betId: string }>();

  console.log("LocalSearchParams:", { id, betId });

  const { user } = useAuthStore();
  const { getGroupById } = useGroupsStore();
  // Obtenemos el grupo
  const group = getGroupById(id);
  console.log("Group obtenido:", group);

  // Para la apuesta, la extraemos del grupo
  const bet = group?.bets?.find(b => String(b.id).trim() === String(betId).trim());
  console.log("Bet obtenida desde el group:", bet);

  const participations = bet ? useBetsStore().getBetParticipations(betId) : [];
  console.log("Participaciones:", participations);
  const userParticipation = user ? useBetsStore().getUserParticipationInBet(betId, user.id) : undefined;
  console.log("UserParticipation:", userParticipation);

  if (!bet || !group) {
    console.log("Faltan datos: bet o group son undefined");
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={{ color: 'red', textAlign: 'center' }}>Cargando datos de la apuesta...</Text>
      </SafeAreaView>
    );
  }

  // Estadísticas
  const totalParticipants = participations.length;
  const totalPot = participations.reduce((sum, p) => sum + p.amount, 0);
  const averageBet = totalParticipants > 0 ? totalPot / totalParticipants : 0;
  const highestBet = totalParticipants > 0 ? Math.max(...participations.map(p => p.amount)) : 0;

  // Distribución de opciones
  const optionsDistribution = bet.options?.map(option => {
    const optionBets = participations.filter(p => p.optionId === option.id);
    const percentage = totalParticipants > 0 ? (optionBets.length / totalParticipants) * 100 : 0;
    return {
      ...option,
      percentage,
      count: optionBets.length,
    };
  }) || [];

  // Estados para el formulario de apuesta
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<string>('100');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userParticipation) {
      setSelectedOption(userParticipation.optionId);
      setBetAmount(userParticipation.amount.toString());
    }
  }, [userParticipation]);

  // Saldo disponible del usuario en el grupo
  const userMember = group.members.find(m => m.userId === user?.id);
  const userCoins = userMember?.groupCoins || 0;

  // Usar los nombres de campo de la BD
  const endDate = bet.end_date ? formatDate(new Date(bet.end_date)) : 'Sin fecha';
  const creationDate = bet.created_at ? formatDate(new Date(bet.created_at)) : 'Sin fecha';

  const handlePlaceBet = async () => {
    if (!user || !selectedOption || !betAmount || isSubmitting) return;
    
    const amount = parseInt(betAmount);
    if (isNaN(amount) || amount <= 0 || amount > userCoins) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    try {
      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await useBetsStore().participateInBet(betId, user.id, selectedOption, amount);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error al colocar apuesta:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBetOpen = bet.status === 'open';
  const canPlaceBet = isBetOpen && !!user && !userParticipation;

  // Altura fija para la cabecera
  const HEADER_HEIGHT = 20;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Cabecera fija con el nombre del grupo */}
        <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.fixedHeaderTitle, { color: colors.text }]} numberOfLines={1}>
            {group.name}
          </Text>
        </View>
        {/* Contenido desplazable, con paddingTop para no quedar tapado por la cabecera */}
        <ScrollView contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingHorizontal: 10 }}>
          {/* Tarjeta Principal */}
          <View style={[styles.mainCard, { backgroundColor: colors.card }]}>
            <View style={styles.betTypeRow}>
              <View style={styles.betTypeBadge}>
                <Trophy size={14} color="#000" />
                <Text style={styles.betTypeText}>
                  {bet.options?.length === 2 ? 'Binary Bet' : 'Multiple Bet'}
                </Text>
              </View>
              <Text style={[styles.groupName, { color: colors.textSecondary }]}>{group.name}</Text>
            </View>
            <Text style={[styles.betTitle, { color: colors.text }]}>{bet.title}</Text>
            {bet.description && (
              <Text style={[styles.betDescription, { color: colors.textSecondary }]}>{bet.description}</Text>
            )}
            <View style={styles.dateRow}>
              <Clock size={14} color={colors.textSecondary} style={styles.icon} />
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>{creationDate}</Text>
            </View>
            <View style={styles.dateRow}>
              <Clock size={14} color={colors.textSecondary} style={styles.icon} />
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>{t('ends')}: {endDate}</Text>
            </View>
          </View>
          
          {/* Colocar Apuesta */}
          {canPlaceBet && (
            <View style={[styles.placeBetCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('placeYourBet')}</Text>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>{t('selectOption')}:</Text>
              <View style={styles.optionsContainer}>
                {bet.options?.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      selectedOption === option.id && { backgroundColor: colors.primary },
                      { borderColor: colors.border },
                    ]}
                    onPress={() => setSelectedOption(option.id)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        selectedOption === option.id 
                          ? { color: '#000', fontWeight: 'bold' } 
                          : { color: colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.formLabel, { color: colors.textSecondary, marginTop: 16 }]}>{t('betAmount')} (coins)</Text>
              <TextInput
                style={[
                  styles.betAmountInput,
                  { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
                ]}
                value={betAmount}
                onChangeText={setBetAmount}
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
              <View style={styles.balanceRow}>
                <Text style={{ color: colors.textSecondary }}>{t('available')}: </Text>
                <Text style={{ color: '#FFD60A', fontWeight: 'bold' }}>{userCoins} coins</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.placeBetButton,
                  (!selectedOption || !betAmount || isSubmitting) && { opacity: 0.6 },
                ]}
                onPress={handlePlaceBet}
                disabled={!selectedOption || !betAmount || isSubmitting}
              >
                <Text style={styles.placeBetButtonText}>
                  {isSubmitting ? t('placing') : t('placeBet')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Participantes */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('participants')}</Text>
              <View style={styles.countBadge}>
                <Users size={14} color="#fff" style={styles.countIcon} />
                <Text style={styles.countText}>{totalParticipants}</Text>
              </View>
            </View>
            {totalParticipants > 0 ? (
              <View style={styles.participantsList}>
                {/* Lista de participantes */}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noParticipants')}</Text>
            )}
          </View>
          
          {/* Estadísticas */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('betStatistics')}</Text>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('totalPot')}</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{totalPot} coins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('averageBet')}</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{Math.round(averageBet)} coins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('highestBet')}</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{highestBet} coins</Text>
            </View>
            <View style={styles.separator} />
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>{t('optionsDistribution')}</Text>
            {optionsDistribution.map(option => (
              <View key={option.id} style={styles.distributionItem}>
                <Text style={[styles.distributionLabel, { color: colors.text }]}>{option.label}</Text>
                <Text style={[styles.distributionValue, { color: colors.text }]}>{option.percentage.toFixed(0)}%</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fixedHeader: {
    marginTop: 32,
    left: 0,
    right: 0,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  fixedHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  mainCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  betTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  betTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD60A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  betTypeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  },
  groupName: {
    fontSize: 14,
  },
  betTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  betDescription: {
    fontSize: 16,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  icon: {
    marginRight: 6,
  },
  dateText: {
    fontSize: 14,
  },
  placeBetCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  optionButtonText: {
    fontSize: 15,
  },
  betAmountInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  placeBetButton: {
    backgroundColor: '#FFD60A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeBetButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  countIcon: {
    marginRight: 4,
  },
  countText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
  },
  participantsList: {
    // Estilos para la lista de participantes
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 8,
  },
  distributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  distributionLabel: {
    fontSize: 14,
  },
  distributionValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
