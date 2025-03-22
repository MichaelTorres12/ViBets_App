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
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Trophy, Users, Clock } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useBetsStore } from '@/store/bets-store';
import { useGroupsStore } from '@/store/groups-store';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Image } from 'react-native';

// Función para formatear fechas
function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export default function BetDetailScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const { id, betId } = useLocalSearchParams<{ id: string; betId: string }>();

  const { user, getUserById } = useAuthStore();
  const group = useGroupsStore((state) => state.groups.find((g) => g.id === id));
  const fetchGroups = useGroupsStore((state) => state.fetchGroups);
  const betsStore = useBetsStore();

  // Si el grupo aún no está cargado, se dispara fetchGroups (esto se hace una sola vez)
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

  // Extraemos la apuesta específica comparando como strings para evitar problemas de espacios
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

  // Obtenemos las participaciones de esta apuesta
  const participations = betsStore.getBetParticipations(betId);
  console.log("BetDetailScreen - participations for bet", betId, participations);
  const userParticipation = user
    ? betsStore.getUserParticipationInBet(betId, user.id)
    : undefined;

  // Estadísticas
  const totalParticipants = participations.length;
  const totalPot = participations.reduce((sum, p) => sum + p.amount, 0);
  const averageBet = totalParticipants > 0 ? totalPot / totalParticipants : 0;
  const highestBet =
    totalParticipants > 0 ? Math.max(...participations.map((p) => p.amount)) : 0;

  // Distribución de opciones
  const optionsDistribution = bet.options?.map((option) => {
    const optionBets = participations.filter((p) => p.optionId === option.id);
    const percentage =
      totalParticipants > 0 ? (optionBets.length / totalParticipants) * 100 : 0;
    return { ...option, percentage, count: optionBets.length };
  }) || [];

  // Estados locales para el formulario y mensajes
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<string>('100');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (userParticipation) {
      setSelectedOption(userParticipation.optionId);
      setBetAmount(userParticipation.amount.toString());
    }
  }, [userParticipation]);

  // Saldo del usuario en el grupo
  const userMember = group.members.find((m) => m.userId === user?.id);
  const userCoins = userMember?.groupCoins || 0;

  // Formateo de fechas
  const endDate = bet.end_date ? formatDate(new Date(bet.end_date)) : 'Sin fecha';
  const creationDate = bet.created_at ? formatDate(new Date(bet.created_at)) : 'Sin fecha';

  // Función para obtener el nombre del creador de la apuesta
  const getCreatorUsername = (creatorId: string) => {
    const creatorMember = group.members.find(
      (member) => member.userId === creatorId
    );
    if (creatorMember && creatorMember.username) {
      return creatorMember.username;
    }
    const creator = getUserById ? getUserById(creatorId) : null;
    return creator?.username || t('betCreator') || 'Bet Creator';
  };

  // Determinar si el usuario puede apostar (si la apuesta está abierta y el usuario NO ha apostado)
  const isBetOpen = bet.status === 'open';
  const canPlaceBet = isBetOpen && !!user && !userParticipation;

  // Función para colocar la apuesta
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
      // Después de apostar, redirigimos a la vista de GroupBets
      router.push(`/groups/${id}?tab=bets`);
    } catch (error) {
      console.error('Error al colocar apuesta:', error);
      setErrorMessage(t('betPlaceError') || "Error al colocar apuesta");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: group.name }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 10 }}>
          {/* Mensajes */}
          {successMessage ? <Text style={styles.successMessage}>{successMessage}</Text> : null}
          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

          {/* Detalles de la Apuesta */}
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
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>{t('ends')}: {endDate}</Text>
            </View>
          </View>

          {/* Formulario de apuesta o mensaje: si ya apostó, se muestra mensaje */}
          {canPlaceBet ? (
            <View style={[styles.placeBetCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('placeYourBet')}</Text>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>{t('selectOption')}:</Text>
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
                <Text style={{ color: '#FFD60A', fontWeight: 'bold' }}>{userCoins} {t('coins')}</Text>
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

{/* Lista de Participantes */}
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

        // Nombre o fallback
        const username = member?.username || "Usuario desconocido";
        // Dos primeras letras (mayúsculas) o "??"
        const initials = username.substring(0, 2).toUpperCase() || "??";

        return (
          <View key={p.id} style={styles.participantItem}>
            {/* Avatar con iniciales */}
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            {/* Info: Nombre y Opción */}
            <View style={styles.participantInfo}>
              <Text style={[styles.name, { color: colors.text }]}>
                {username}
              </Text>
              <Text style={[styles.option, { color: colors.textSecondary }]}>
                {t('option')}: {option?.label || "Opción desconocida"}
              </Text>
            </View>

            {/* Cantidad */}
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



          {/* Sección de Estadísticas */}
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
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>{t('optionsDistribution')}</Text>
            {optionsDistribution.map((option) => (
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
    position: 'absolute',
    top: 0,
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
    // margen o padding si deseas
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#1B1B1B', // Ejemplo, o usa un color del tema
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
    // Deja espacio para que la cantidad se alinee a la derecha
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
    // color: '#FFD60A', // Ejemplo si quieres destacar
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
});
