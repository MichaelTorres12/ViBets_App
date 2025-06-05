// app/bets/[id].tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeContext';
// import { useAuthStore } from '@/store/auth-store';  // <-- ELIMINAR
import { useAuth } from '@/store/auth-context';       // <-- AGREGAR
import { useBetsStore } from '@/store/bets-store';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { supabase } from '@/services/supabaseClient';
import { BetStatus } from '@/types';

export default function BetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  // const { user } = useAuthStore(); // <-- BORRAR
  const { user } = useAuth();        // <-- USAR AuthContext en su lugar

  const {
    getBetById,
    getBetParticipations,
    getUserParticipationInBet,
    participateInBet,
    settleBet,
    loading
  } = useBetsStore();
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState('100');
  const [error, setError] = useState('');

  const bet = getBetById(id);
  const participations = getBetParticipations(id);
  const userParticipation = user ? getUserParticipationInBet(id, user.id) : undefined;
  
  useEffect(() => {
    if (userParticipation) {
      setSelectedOption(userParticipation.optionId);
      setBetAmount(userParticipation.amount.toString());
    }
  }, [userParticipation]);
  
  if (!bet) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Prediction not found</Text>
      </View>
    );
  }
  
  const isCreator = user && bet.createdBy === user.id;
  const canSettle = isCreator && bet.status === 'open' && new Date(bet.endDate) <= new Date();
  const canParticipate = user && bet.status === 'open' && new Date(bet.endDate) > new Date();
  
  const handlePlaceBet = async () => {
    if (!user || !selectedOption) return;
    
    const amount = parseInt(betAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid prediction amount');
      return;
    }
    
    try {
      await participateInBet(id, user.id, selectedOption, amount);
      Alert.alert('Success', 'Your prediction has been placed!');
    } catch (error) {
      console.error('Error placing prediction:', error);
      Alert.alert('Error', 'Failed to place prediction. Please try again.');
    }
  };
  
  const handleSettleBet = async (optionId: string) => {
    if (!user) return;
    
    try {
      await settleBet(id, optionId);
      Alert.alert('Success', 'Prediction has been settled!');
    } catch (error) {
      console.error('Error settling prediction:', error);
      Alert.alert('Error', 'Failed to settle prediction. Please try again.');
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Prediction Details' }} />
      <ScrollView style={styles.scrollView}>
        <Text style={[styles.title, { color: colors.text }]}>{bet.title}</Text>
        
        {bet.description && (
          <Text style={[styles.description, { color: colors.text }]}>{bet.description}</Text>
        )}
        
        <View style={styles.infoContainer}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Status:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
          </Text>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>End Date:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {new Date(bet.endDate).toLocaleDateString()}
          </Text>
        </View>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Options</Text>
        
        {bet.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isWinner = bet.settledOption === option.id;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                { borderColor: colors.border },
                isSelected && { borderColor: colors.primary },
                isWinner && { borderColor: colors.success },
              ]}
              onPress={() => canParticipate && setSelectedOption(option.id)}
              disabled={!canParticipate}
            >
              <View style={styles.optionHeader}>
                <Text style={[styles.optionText, { color: colors.text }]}>{option.text}</Text>
                <Text style={[styles.oddsText, { color: colors.primary }]}>
                  {option.odds.toFixed(2)}x
                </Text>
              </View>
              
              {isWinner && (
                <View style={[styles.winnerBadge, { backgroundColor: colors.success }]}>
                  <Text style={styles.winnerText}>Winner</Text>
                </View>
              )}
              
              {canSettle && (
                <TouchableOpacity
                  style={[styles.settleButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    Alert.alert(
                      'Settle Prediction',
                      `Are you sure "${option.text}" is the winning option?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Confirm', onPress: () => handleSettleBet(option.id) }
                      ]
                    );
                  }}
                >
                  <Text style={styles.settleButtonText}>Select as Winner</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
        
        {canParticipate && (
          <View style={styles.placeBetContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Place Your Prediction</Text>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <Input
              label="Prediction Amount (Coins)"
              value={betAmount}
              onChangeText={setBetAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
            />
            
            <Button
              title={userParticipation ? "Update Prediction" : "Place Prediction"}
              onPress={handlePlaceBet}
              isLoading={loading}
              disabled={!selectedOption}
              style={{ marginTop: 16 }}
            />
          </View>
        )}
        
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Participants</Text>
        
        {participations.length === 0 ? (
          <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
            No one has placed a prediction yet
          </Text>
        ) : (
          participations.map((participation) => {
            const option = bet.options.find(o => o.id === participation.optionId);
            return (
              <View key={participation.id} style={[styles.participationCard, { borderColor: colors.border }]}>
                <Text style={[styles.participantName, { color: colors.text }]}>
                  User {participation.userId.substring(0, 8)}
                </Text>
                <Text style={[styles.participationDetails, { color: colors.textSecondary }]}>
                  Prediction {participation.amount} coins on "{option?.text}"
                </Text>
                {bet.status === 'settled' && (
                  <Text
                    style={[
                      styles.participationStatus,
                      { color: participation.status === 'won' ? colors.success : colors.error }
                    ]}
                  >
                    {participation.status === 'won' ? 'Won' : 'Lost'}
                  </Text>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  optionCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  oddsText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  winnerBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  winnerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  settleButton: {
    marginTop: 12,
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  settleButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  placeBetContainer: {
    marginTop: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  noDataText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  participationCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
  },
  participationDetails: {
    fontSize: 14,
    marginTop: 4,
  },
  participationStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
