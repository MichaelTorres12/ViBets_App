import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  FlatList,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Card } from '@/components/Card';
import { useAuth } from '@/store/auth-context';
import { useGroupsStore } from '@/store/groups-store';
import {
  Plus,
  Minus,
  Layers,
  ChevronsRight,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  ArrowLeft,
  X,
  Check,
} from 'lucide-react-native';

// Datos de ejemplo para apuestas disponibles
const MOCK_BETS = [
  {
    id: 'bet1',
    title: 'Real Madrid vs Barcelona',
    description: '¿Quién ganará El Clásico?',
    created_at: '2023-10-15T12:00:00Z',
    end_date: '2023-10-29T20:00:00Z',
    status: 'open',
    options: [
      { id: 'opt1', text: 'Real Madrid', odds: 2.1 },
      { id: 'opt2', text: 'Barcelona', odds: 2.5 },
      { id: 'opt3', text: 'Empate', odds: 3.1 },
    ],
  },
  {
    id: 'bet2',
    title: 'Liverpool vs Manchester City',
    description: 'Partido de Premier League',
    created_at: '2023-10-16T14:00:00Z',
    end_date: '2023-10-30T16:00:00Z',
    status: 'open',
    options: [
      { id: 'opt4', text: 'Liverpool', odds: 2.3 },
      { id: 'opt5', text: 'Manchester City', odds: 1.9 },
      { id: 'opt6', text: 'Empate', odds: 3.4 },
    ],
  },
  {
    id: 'bet3',
    title: 'Bayern Munich vs Borussia Dortmund',
    description: 'Der Klassiker de la Bundesliga',
    created_at: '2023-10-17T10:00:00Z',
    end_date: '2023-10-31T19:30:00Z',
    status: 'open',
    options: [
      { id: 'opt7', text: 'Bayern Munich', odds: 1.7 },
      { id: 'opt8', text: 'Borussia Dortmund', odds: 3.2 },
      { id: 'opt9', text: 'Empate', odds: 3.6 },
    ],
  },
  {
    id: 'bet4',
    title: 'PSG vs Olympique Marseille',
    description: 'Le Classique de la Ligue 1',
    created_at: '2023-10-18T09:00:00Z',
    end_date: '2023-11-01T20:45:00Z',
    status: 'open',
    options: [
      { id: 'opt10', text: 'PSG', odds: 1.5 },
      { id: 'opt11', text: 'Olympique Marseille', odds: 4.0 },
      { id: 'opt12', text: 'Empate', odds: 3.5 },
    ],
  },
  {
    id: 'bet5',
    title: 'Juventus vs Inter de Milán',
    description: 'Derby d\'Italia de la Serie A',
    created_at: '2023-10-19T11:00:00Z',
    end_date: '2023-11-02T20:45:00Z',
    status: 'open',
    options: [
      { id: 'opt13', text: 'Juventus', odds: 2.4 },
      { id: 'opt14', text: 'Inter de Milán', odds: 2.2 },
      { id: 'opt15', text: 'Empate', odds: 3.2 },
    ],
  },
];

export default function CreateParlayScreen() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const { colors, theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const isLight = theme === 'light';

  // Estado para manejar los datos de la apuesta combinada
  const [amount, setAmount] = useState('100');
  const [selectedBets, setSelectedBets] = useState<Array<{
    betId: string;
    optionId: string;
    betTitle: string;
    optionText: string;
    odds: number;
  }>>([]);

  // Calcular multiplicadores y ganancias potenciales
  const calculateMultiplier = () => {
    if (selectedBets.length === 0) return 1;
    return selectedBets.reduce((acc, bet) => acc * bet.odds, 1);
  };

  const calculatePotentialWinnings = () => {
    const betAmount = parseFloat(amount) || 0;
    return betAmount * calculateMultiplier();
  };

  // Formatear número con 2 decimales
  const formatNumber = (num: number) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Manejar la selección de una opción de apuesta
  const handleSelectOption = (betId: string, optionId: string, betTitle: string, optionText: string, odds: number) => {
    // Verificar si ya hay una selección para esta apuesta
    const existingBetIndex = selectedBets.findIndex(bet => bet.betId === betId);
    
    if (existingBetIndex !== -1) {
      // Si la misma opción ya está seleccionada, la eliminamos
      if (selectedBets[existingBetIndex].optionId === optionId) {
        setSelectedBets(selectedBets.filter(bet => bet.betId !== betId));
      } else {
        // Si es otra opción de la misma apuesta, la actualizamos
        const updatedBets = [...selectedBets];
        updatedBets[existingBetIndex] = { betId, optionId, betTitle, optionText, odds };
        setSelectedBets(updatedBets);
      }
    } else {
      // Agregar nueva selección
      setSelectedBets([...selectedBets, { betId, optionId, betTitle, optionText, odds }]);
    }
  };

  // Función para crear la apuesta combinada
  const createParlay = () => {
    if (selectedBets.length < 2) {
      Alert.alert(
        t('tooFewBets') || 'Pocas apuestas',
        t('needAtLeastTwoBets') || 'Una combinada necesita al menos 2 apuestas seleccionadas.'
      );
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert(
        t('invalidAmount') || 'Monto inválido',
        t('enterPositiveAmount') || 'Por favor ingresa un monto mayor a 0.'
      );
      return;
    }

    // Aquí iría la lógica para guardar la apuesta combinada
    // Por ahora solo mostraremos una alerta de éxito
    Alert.alert(
      t('parlayCreated') || 'Combinada creada',
      t('parlayCreatedSuccess') || 'Tu apuesta combinada ha sido creada exitosamente.',
      [
        {
          text: t('ok') || 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  // Renderizar cada apuesta disponible
  const renderAvailableBet = ({ item }: { item: any }) => {
    // Verificar si esta apuesta ya está seleccionada
    const selectedOption = selectedBets.find(bet => bet.betId === item.id);
    
    return (
      <Card 
        style={[styles.betCard, { borderColor: selectedOption ? colors.primary : colors.border }]}
        variant={isLight ? "elevated" : "default"}
      >
        <Text style={[styles.betTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.betDescription, { color: colors.textSecondary }]}>{item.description}</Text>
        
        <View style={styles.optionsContainer}>
          {item.options.map((option: any) => {
            const isSelected = selectedOption?.optionId === option.id;
            
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: isSelected ? `${colors.primary}20` : isLight ? colors.cardLight : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleSelectOption(item.id, option.id, item.title, option.text, option.odds)}
              >
                <View style={styles.optionContent}>
                  <Text style={[styles.optionText, { color: colors.text }]}>{option.text}</Text>
                  <Text style={[styles.oddsText, { color: isSelected ? colors.primary : colors.textSecondary }]}>
                    {option.odds.toFixed(1)}x
                  </Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkIndicator, { backgroundColor: colors.primary }]}>
                    <Check size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>
    );
  };

  // Renderizar cada apuesta seleccionada en el resumen
  const renderSelectedBet = ({ item, index }: { item: any, index: number }) => (
    <View style={[styles.selectionItem, { backgroundColor: isLight ? colors.cardLight : colors.card }]}>
      <Text style={[styles.selectionCount, { backgroundColor: colors.primary, color: '#fff' }]}>
        {index + 1}
      </Text>
      <View style={styles.selectionContent}>
        <Text style={[styles.selectionTitle, { color: colors.text }]} numberOfLines={1}>
          {item.betTitle}
        </Text>
        <Text style={[styles.selectionOption, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.optionText} <Text style={{ color: colors.primary }}>{item.odds.toFixed(2)}x</Text>
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.removeButton, { backgroundColor: `${colors.error}15` }]}
        onPress={() => setSelectedBets(selectedBets.filter(bet => !(bet.betId === item.betId && bet.optionId === item.optionId)))}
      >
        <X size={16} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: t('createParlay') || 'Crear Combinada',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView style={styles.scrollContainer}>
        {/* Sección 1: Selección de apuestas */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('selectBets') || 'Selecciona apuestas'}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            {t('selectBetsDescription') || 'Selecciona al menos 2 apuestas para tu combinada'}
          </Text>

          <FlatList
            data={MOCK_BETS}
            renderItem={renderAvailableBet}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.betsList}
          />
        </View>

        {/* Sección 2: Resumen de selecciones */}
        {selectedBets.length > 0 && (
          <View style={[styles.section, styles.summarySection]}>
            <View style={styles.sectionHeader}>
              <Layers size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('yourParlay') || 'Tu Combinada'}
              </Text>
            </View>

            <FlatList
              data={selectedBets}
              renderItem={renderSelectedBet}
              keyExtractor={(item, index) => `${item.betId}-${item.optionId}-${index}`}
              scrollEnabled={false}
              contentContainerStyle={styles.selectionsList}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('noBetsSelected') || 'No has seleccionado apuestas aún'}
                </Text>
              }
            />

            {selectedBets.length > 0 && (
              <View style={[styles.multiplierContainer, { backgroundColor: isLight ? `${colors.primary}10` : `${colors.primary}20` }]}>
                <Text style={[styles.multiplierLabel, { color: colors.textSecondary }]}>
                  {t('totalMultiplier') || 'Multiplicador total'}
                </Text>
                <Text style={[styles.multiplierValue, { color: colors.primary }]}>
                  {formatNumber(calculateMultiplier())}x
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Sección 3: Monto y ganancias potenciales */}
        <Card style={styles.amountCard} variant={isLight ? "elevated" : "default"}>
          <Text style={[styles.amountLabel, { color: colors.text }]}>
            {t('betAmount') || 'Monto a apostar'}
          </Text>
          <View style={[styles.amountInputContainer, { backgroundColor: isLight ? colors.cardLight : colors.card, borderColor: colors.border }]}>
            <Text style={[styles.currencySymbol, { color: colors.text }]}>₡</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={[styles.potentialWinningsContainer, { backgroundColor: isLight ? `${colors.success}10` : `${colors.success}20` }]}>
            <View style={styles.potentialWinningsHeader}>
              <DollarSign size={16} color={colors.success} />
              <Text style={[styles.potentialWinningsLabel, { color: colors.textSecondary }]}>
                {t('potentialWinnings') || 'Ganancias potenciales'}
              </Text>
            </View>
            <Text style={[styles.potentialWinningsValue, { color: colors.success }]}>
              ₡{formatNumber(calculatePotentialWinnings())}
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Botón de creación */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <View style={styles.footerContent}>
          <TouchableOpacity
            style={[
              styles.createButton,
              {
                backgroundColor: selectedBets.length >= 2 ? colors.primary : colors.textTertiary,
                opacity: selectedBets.length >= 2 ? 1 : 0.7,
              },
            ]}
            onPress={createParlay}
            disabled={selectedBets.length < 2}
          >
            <Text style={styles.createButtonText}>
              {t('createParlay') || 'Crear Combinada'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  betsList: {
    gap: 12,
  },
  betCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 4,
  },
  betTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  betDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
    minWidth: '31%',
    flex: 1,
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  oddsText: {
    fontSize: 13,
    marginTop: 2,
  },
  checkIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summarySection: {
    marginTop: 8,
  },
  selectionsList: {
    gap: 8,
    marginBottom: 16,
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
  },
  selectionCount: {
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: 'bold',
    marginRight: 12,
    fontSize: 14,
  },
  selectionContent: {
    flex: 1,
  },
  selectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  selectionOption: {
    fontSize: 13,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
    fontSize: 14,
  },
  multiplierContainer: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  multiplierLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  multiplierValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  amountCard: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 100,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 18,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    height: 48,
    fontSize: 18,
    fontWeight: '500',
  },
  potentialWinningsContainer: {
    borderRadius: 12,
    padding: 16,
  },
  potentialWinningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  potentialWinningsLabel: {
    marginLeft: 8,
    fontSize: 14,
  },
  potentialWinningsValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  footerContent: {
    flexDirection: 'row',
  },
  createButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
