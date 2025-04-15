// app/groups/[id]/bet/[betId].tsx
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
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Trophy, Users, Clock, Check, AlertCircle } from 'lucide-react-native';
// import { useAuthStore } from '@/store/auth-store'; // <-- ELIMINAR
import { useAuth } from '@/store/auth-context';       // <-- AÑADIR
import { useBetsStore } from '@/store/bets-store';
import { useGroupsStore } from '@/store/groups-store';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Image } from 'react-native';
import { Card } from '@/components/Card';
import { supabase } from '@/services/supabaseClient';

function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export default function BetDetailScreen() {
  const { colors, theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const { id, betId } = useLocalSearchParams<{ id: string; betId: string }>();

  // const { user, getUserById } = useAuthStore(); // <-- BORRAR
  const { user } = useAuth();                     // <-- USAR AuthContext, quita getUserById o muévelo si es necesario

  const group = useGroupsStore((state) => state.groups.find((g) => g.id === id));
  const fetchGroups = useGroupsStore((state) => state.fetchGroups);
  const betsStore = useBetsStore();

  useEffect(() => {
    if (group?.id) {
      betsStore.fetchBets(group.id);
    }
  }, [group?.id]);

  if (!group) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={{ color: 'red', textAlign: 'center' }}>
          {t('loadingGroup') || 'Cargando datos del grupo...'}
        </Text>
      </SafeAreaView>
    );
  }

  const bet = group.bets?.find(
    (b) => String(b.id).trim() === String(betId).trim()
  );
  if (!bet) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={{ color: 'red', textAlign: 'center' }}>
          {t('loadingBet') || 'Cargando datos de la apuesta...'}
        </Text>
      </SafeAreaView>
    );
  }

  // Extraemos participaciones
  const participations = betsStore.getBetParticipations(betId);
  const userParticipation = user
    ? betsStore.getUserParticipationInBet(betId, user.id)
    : undefined;

  const totalParticipants = participations.length;
  const totalPot = participations.reduce((sum, p) => sum + p.amount, 0);
  const averageBet = totalParticipants > 0 ? totalPot / totalParticipants : 0;
  const highestBet = totalParticipants > 0
    ? Math.max(...participations.map((p) => p.amount))
    : 0;

  const optionsDistribution = bet.options?.map((option) => {
    const optionBets = participations.filter((p) => p.optionId === option.id);
    const percentage =
      totalParticipants > 0 ? (optionBets.length / totalParticipants) * 100 : 0;
    return { ...option, percentage, count: optionBets.length };
  }) || [];

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<string>('100');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Estado para confirmación
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  // Verificar si el usuario es el creador de la apuesta
  const isCreator = bet && user && bet.createdBy === user.id;
  
  // Verificar si la apuesta está cerrada y aún no está resuelta
  const canSettle = bet && bet.status === 'closed' && !bet.settledOption;

  useEffect(() => {
    if (userParticipation) {
      setSelectedOption(userParticipation.optionId);
      setBetAmount(userParticipation.amount.toString());
    }
  }, [userParticipation]);

  const userMember = group.members.find((m) => m.userId === user?.id);
  const userCoins = userMember?.groupCoins || 0;

  const endDate = bet.end_date ? formatDate(new Date(bet.end_date)) : 'Sin fecha';
  const creationDate = bet.created_at ? formatDate(new Date(bet.created_at)) : 'Sin fecha';

  // Ejemplo de obtener nombre del creador
  const getCreatorUsername = (creatorId: string) => {
    const creatorMember = group.members.find(
      (member) => member.userId === creatorId
    );
    if (creatorMember && creatorMember.username) {
      return creatorMember.username;
    }
    // fallback:
    return t('betCreator') || 'Bet Creator';
  };

  const isBetOpen = bet.status === 'open';
  const canPlaceBet = isBetOpen && !!user && !userParticipation;

  const handlePlaceBet = async () => {
    setSuccessMessage('');
    setErrorMessage('');

    if (!user || !selectedOption || !betAmount || isSubmitting) return;
    const amount = parseInt(betAmount);
    if (isNaN(amount) || amount <= 0 || amount > userCoins) {
      setErrorMessage(t('invalidBetData') || "Datos de apuesta inválidos");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await betsStore.participateInBet(betId, user.id, selectedOption, amount);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccessMessage(t('betPlacedSuccess') || "¡Apuesta realizada con éxito!");
      router.push(`/groups/${id}?tab=bets`);
    } catch (error) {
      console.error('Error al colocar apuesta:', error);
      setErrorMessage(t('betPlaceError') || "Error al colocar apuesta");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar la selección de opción ganadora
  const handleSelectWinner = (optionId: string) => {
    setSelectedOption(optionId);
    setConfirmationVisible(true);
  };
  
  // Confirmar y establecer el ganador
  const confirmWinningOption = async () => {
    if (!selectedOption) return;
    
    try {
      await betsStore.setWinningOption(betId, selectedOption);
      await betsStore.distributePrize(betId);
      Alert.alert(
        t('success') || 'Success', 
        t('winnerDeclared') || 'Winner has been declared and prizes distributed!'
      );
      setConfirmationVisible(false);
    } catch (error) {
      console.error('Error setting winner:', error);
      Alert.alert(
        t('error') || 'Error', 
        t('couldNotDeclareWinner') || 'Could not declare the winner. Please try again.'
      );
    }
  };

  const handleSettleBet = async (optionId: string) => {
    try {
      if (!user) {
        Alert.alert(
          t('error') || 'Error',
          t('mustBeLoggedIn') || 'You must be logged in'
        );
        return;
      }

      // Usar la función SQL settle_bet en lugar de actualizar directamente
      const { data, error } = await supabase.rpc('settle_bet', {
        p_bet_id: betId,
        p_winning_option: optionId,
        p_user_id: user.id
      });
      
      if (error) {
        console.error('Error calling settle_bet:', error);
        throw error;
      }
      
      console.log('Settle bet result:', data);
      
      // Recargar apuesta actualizada
      if (group?.id) {
        betsStore.fetchBets(group.id);
      }
      
      Alert.alert(
        t('success') || 'Success',
        t('winningOptionSet') || 'Winning option has been set'
      );
    } catch (error: any) {
      console.error('Error setting winning option:', error);
      Alert.alert(
        t('error') || 'Error',
        error.message || t('errorSettingWinningOption') || 'Error setting winning option'
      );
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: group.name }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 10 }}>

          {successMessage ? <Text style={styles.successMessage}>{successMessage}</Text> : null}
          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

          <View style={[styles.mainCard, { backgroundColor: colors.card }]}>
            <View style={styles.betTypeRow}>
              <View style={styles.betTypeBadge}>
                <Trophy size={14} color="#000" />
                <Text style={styles.betTypeText}>
                  {bet.options?.length === 2 ? 'Binary Bet' : 'Multiple Bet'}
                </Text>
              </View>
              <Text style={[styles.groupName, { color: colors.textSecondary }]}>
                {bet.created_by ? getCreatorUsername(bet.created_by) : t('unknownCreator')}
              </Text>
            </View>
            <Text style={[styles.betTitle, { color: colors.text }]}>{bet.title}</Text>
            {bet.description && (
              <Text style={[styles.betDescription, { color: colors.textSecondary }]}>
                {bet.description}
              </Text>
            )}
            <View style={styles.dateRow}>
              <Clock size={14} color={colors.textSecondary} style={styles.icon} />
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>{creationDate}</Text>
            </View>
            <View style={styles.dateRow}>
              <Clock size={14} color={colors.textSecondary} style={styles.icon} />
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {t('ends')}: {endDate}
              </Text>
            </View>
          </View>

          {bet && bet.status === 'settled' && bet.settled_option && (
            <View style={[styles.winnerContainer, { backgroundColor: `${colors.success}20` }]}>
              <Trophy size={24} color={colors.success} style={styles.winnerIcon} />
              <View>
                <Text style={[styles.winnerLabel, { color: colors.textSecondary }]}>
                  {t('winningOption') || 'Winning option:'}
                </Text>
                <Text style={[styles.winnerOption, { color: colors.text }]}>
                  {bet.options?.find(opt => opt.id === bet.settled_option)?.label || ''}
                </Text>
              </View>
            </View>
          )}

          {canPlaceBet ? (
            <View style={[styles.placeBetCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('placeYourBet')}
              </Text>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                {t('selectOption')}:
              </Text>
              <View style={styles.optionsContainer}>
                {bet.options?.map((option) => (
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
              <Text
                style={[
                  styles.formLabel,
                  { color: colors.textSecondary, marginTop: 16 },
                ]}
              >
                {t('betAmount')} (coins)
              </Text>
              <TextInput
                style={[
                  styles.betAmountInput,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={betAmount}
                onChangeText={setBetAmount}
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
              <View style={styles.balanceRow}>
                <Text style={{ color: colors.textSecondary }}>{t('available')}: </Text>
                <Text style={{ color: '#FFD60A', fontWeight: 'bold' }}>
                  {userCoins} {t('coins')}
                </Text>
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
          ) : (
            <View style={styles.alreadyVoted}>
              <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>
                {t('alreadyVoted') || "Ya has apostado"}
              </Text>
            </View>
          )}

          <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('participants')}
              </Text>
              <View style={styles.countBadge}>
                <Users size={14} color="#fff" style={styles.countIcon} />
                <Text style={styles.countText}>{totalParticipants}</Text>
              </View>
            </View>

            {totalParticipants > 0 ? (
              <View style={styles.participantsList}>
                {participations.map((p) => {
                  const member = group.members.find((m) => m.userId === p.userId);
                  const option = bet.options?.find((opt) => opt.id === p.optionId);
                  const username = member?.username || "Usuario desconocido";
                  const initials = username.substring(0, 2).toUpperCase() || "??";

                  return (
                    <View key={p.id} style={styles.participantItem}>
                      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarText}>{initials}</Text>
                      </View>
                      <View style={styles.participantInfo}>
                        <Text style={[styles.name, { color: colors.text }]}>
                          {username}
                        </Text>
                        <Text style={[styles.option, { color: colors.textSecondary }]}>
                          {t('option')}: {option?.label || "Opción desconocida"}
                        </Text>
                      </View>
                      <Text style={[styles.amount, { color: colors.text }]}>
                        {p.amount} {t('coins')}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('noParticipants')}
              </Text>
            )}
          </View>

          <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('betStatistics')}</Text>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('totalPot')}</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{totalPot} {t('coins')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('averageBet')}</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{Math.round(averageBet)} {t('coins')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('highestBet')}</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{highestBet} {t('coins')}</Text>
            </View>
            <View style={styles.separator} />
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>
              {t('optionsDistribution')}
            </Text>
            {optionsDistribution.map((option) => (
              <View key={option.id} style={styles.distributionItem}>
                <Text style={[styles.distributionLabel, { color: colors.text }]}>
                  {option.label}
                </Text>
                <Text style={[styles.distributionValue, { color: colors.text }]}>
                  {option.percentage.toFixed(0)}%
                </Text>
              </View>
            ))}
          </View>

          {/* Sección para establecer el ganador (solo visible para el creador si la apuesta está cerrada) */}
          {isCreator && canSettle && (
            <Card style={styles.settleCard} variant="elevated">
              <Text style={[styles.settleTitle, { color: colors.text }]}>
                {t('declareWinner') || 'Declare Winner'}
              </Text>
              <Text style={[styles.settleDescription, { color: colors.textSecondary }]}>
                {t('selectWinningOption') || 'Select the winning option:'}
              </Text>
              
              <View style={styles.optionsList}>
                {bet.options?.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: option.id === selectedOption 
                          ? `${colors.primary}20` 
                          : theme === 'light' ? colors.cardLight : colors.card,
                        borderColor: option.id === selectedOption ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => handleSelectWinner(option.id)}
                  >
                    <Text style={[styles.optionText, { color: colors.text }]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.oddsText, { color: colors.primary }]}>
                      {option.odd}x
                    </Text>
                    {option.id === selectedOption && (
                      <View style={styles.checkContainer}>
                        <Check size={16} color={colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              
              {confirmationVisible && (
                <View style={styles.confirmationBox}>
                  <AlertCircle size={24} color={colors.warning} style={{ marginRight: 8 }} />
                  <Text style={[styles.confirmationText, { color: colors.text }]}>
                    {t('winnerConfirmation') || 'Are you sure? This action cannot be undone.'}
                  </Text>
                  <View style={styles.confirmationButtons}>
                    <TouchableOpacity
                      style={[styles.cancelButton, { backgroundColor: colors.cardLight }]}
                      onPress={() => setConfirmationVisible(false)}
                    >
                      <Text style={{ color: colors.text }}>
                        {t('cancel') || 'Cancel'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                      onPress={confirmWinningOption}
                    >
                      <Text style={{ color: '#fff', fontWeight: '600' }}>
                        {t('confirm') || 'Confirm'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Card>
          )}
          
          {/* Mostrar resultado si la apuesta ya fue resuelta */}
          {bet.settledOption && (
            <Card style={styles.resultCard} variant="elevated">
              <Text style={[styles.resultTitle, { color: colors.text }]}>
                {t('betResult') || 'Bet Result'}
              </Text>
              
              <View style={[styles.winnerBox, { backgroundColor: `${colors.success}15` }]}>
                <Check size={24} color={colors.success} style={{ marginRight: 8 }} />
                <View>
                  <Text style={[styles.winnerLabel, { color: colors.textSecondary }]}>
                    {t('winningOption') || 'Winning Option'}
                  </Text>
                  <Text style={[styles.winnerText, { color: colors.success }]}>
                    {bet.options?.find(o => o.id === bet.settledOption)?.label || 'Unknown'}
                  </Text>
                </View>
              </View>
              
              {/* Opcional: Mostrar tus ganancias o pérdidas */}
              {bet.userParticipation && (
                <View style={styles.userResultContainer}>
                  <Text style={[styles.userResultLabel, { color: colors.textSecondary }]}>
                    {t('yourResult') || 'Your Result'}
                  </Text>
                  {bet.userParticipation.optionId === bet.settledOption ? (
                    <View style={[styles.winBox, { backgroundColor: `${colors.success}15` }]}>
                      <Text style={[styles.winAmount, { color: colors.success }]}>
                        +{(bet.userParticipation.amount * (bet.options?.find(o => o.id === bet.settledOption)?.odd || 0)).toFixed(0)} {t('coins') || 'coins'}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.lossBox, { backgroundColor: `${colors.error}15` }]}>
                      <Text style={[styles.lossAmount, { color: colors.error }]}>
                        -{bet.userParticipation.amount} {t('coins') || 'coins'}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </Card>
          )}

          {bet && bet.created_by === user?.id && bet.status === 'open' && new Date(bet.end_date) < new Date() && (
            <View style={styles.settleSection}>
              <Text style={[styles.settleTitle, { color: colors.text }]}>
                {t('setWinningOption') || 'Set winning option'}
              </Text>
              <Text style={[styles.settleDescription, { color: colors.textSecondary }]}>
                {t('selectWinningOptionDescription') || 'Select the winning option to settle this bet'}
              </Text>
              
              {bet.options?.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.settleOptionButton, { 
                    backgroundColor: colors.cardLight,
                    borderColor: colors.primary
                  }]}
                  onPress={() => {
                    Alert.alert(
                      `${option.label}`,  // Título más prominente con el nombre de la opción
                      `${t('confirmWinningOptionMessage') || '¿Estás seguro de que quieres establecer esta opción como ganadora?'}`,
                      [
                        { text: t('cancel') || 'Cancel', style: 'cancel' },
                        { text: t('confirm') || 'Confirm', onPress: () => handleSettleBet(option.id) }
                      ]
                    );
                  }}
                >
                  <Text style={[styles.settleOptionText, { color: colors.text }]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.settleOptionOdd, { color: colors.primary }]}>
                    {option.odd}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  alreadyVoted: {
    marginVertical: 20,
    alignItems: 'center',
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
    // margen o padding opcional
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#2f3d4d', // ejemplo
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  participantInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  option: {
    fontSize: 14,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  participantText: {
    fontSize: 14,
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
  successMessage: {
    backgroundColor: '#DFF2BF',
    color: '#4F8A10',
    padding: 8,
    borderRadius: 4,
    textAlign: 'center',
    marginBottom: 10,
  },
  errorMessage: {
    backgroundColor: '#FFBABA',
    color: '#D8000C',
    padding: 8,
    borderRadius: 4,
    textAlign: 'center',
    marginBottom: 10,
  },
  settleCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  settleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  settleDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  optionsList: {
    gap: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  oddsText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  checkContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  confirmationText: {
    fontSize: 14,
    marginBottom: 12,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  confirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  resultCard: {
    padding: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  winnerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  winnerLabel: {
    fontSize: 12,
  },
  winnerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userResultContainer: {
    marginTop: 16,
  },
  userResultLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  winBox: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  winAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lossBox: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  lossAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  settleSection: {
    marginTop: 16,
    marginBottom: 50,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD54F',
    backgroundColor: 'rgba(255, 213, 79, 0.1)',
  },
  settleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  settleDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  settleOptionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  settleOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  settleOptionOdd: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  winnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  winnerIcon: {
    marginRight: 12,
  },
  winnerLabel: {
    fontSize: 14,
  },
  winnerOption: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
