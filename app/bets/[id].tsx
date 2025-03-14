// app/bets/[id].tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useBetsStore } from '@/store/bets-store';
import { useGroupsStore } from '@/store/groups-store';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { 
  Users, 
  Clock, 
  Calendar, 
  ChevronLeft,
  Trophy,
  BarChart,
  Coins,
  CheckCircle
} from 'lucide-react-native';

export default function BetDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { 
    getBetById, 
    getBetParticipations, 
    getUserParticipationInBet, 
    placeBet, 
    isLoading 
  } = useBetsStore();
  const { getGroupById, getGroupMember } = useGroupsStore();
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState('100');
  const [error, setError] = useState('');
  
  const bet = getBetById(id);
  
  if (!bet || !user) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Bet not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }
  
  const group = getGroupById(bet.groupId);
  const participations = getBetParticipations(id);
  const userParticipation = getUserParticipationInBet(id, user.id);
  
  // Get user's group-specific coins
  const groupMember = getGroupMember(bet.groupId, user.id);
  const userGroupCoins = groupMember?.groupCoins || 0;
  
  const handlePlaceBet = async () => {
    if (!selectedOption) {
      setError('Please select an option');
      return;
    }
    
    const amount = parseInt(betAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (amount > userGroupCoins) {
      setError("You don't have enough coins");
      return;
    }
    
    try {
      await placeBet(id, selectedOption, amount);
      Alert.alert('Success', 'Your bet has been placed!');
    } catch (err) {
      setError('Failed to place bet. Please try again.');
    }
  };
  
  const renderBetForm = () => {
    if (userParticipation) {
      return (
        <Card style={styles.betPlacedCard}>
          <View style={styles.betPlacedHeader}>
            <CheckCircle size={24} color={colors.success} />
            <Text style={styles.betPlacedTitle}>You've placed your bet</Text>
          </View>
          
          <View style={styles.betPlacedDetails}>
            <Text style={styles.betPlacedLabel}>Your choice:</Text>
            <Text style={styles.betPlacedValue}>{userParticipation.optionId}</Text>
          </View>
          
          <View style={styles.betPlacedDetails}>
            <Text style={styles.betPlacedLabel}>Amount:</Text>
            <Text style={styles.betPlacedValue}>{userParticipation.amount} coins</Text>
          </View>
          
          <View style={styles.betPlacedDetails}>
            <Text style={styles.betPlacedLabel}>Potential winnings:</Text>
            <Text style={styles.betPlacedValue}>{Math.round(userParticipation.amount * 1.8)} coins</Text>
          </View>
        </Card>
      );
    }
    
    return (
      <Card style={styles.betFormCard}>
        <Text style={styles.betFormTitle}>Place Your Bet</Text>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <Text style={styles.optionsLabel}>Select an option:</Text>
        <View style={styles.optionsContainer}>
          {bet.options.map((option, index) => (
            <TouchableOpacity
              key={typeof option.text === 'string' && option.text.length > 0 ? option.text : `option-${index}`}
              style={[
                styles.optionButton,
                selectedOption === String(option.text) && styles.optionButtonSelected,
              ]}
              onPress={() => setSelectedOption(String(option.text))}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  selectedOption === String(option.text) && styles.optionButtonTextSelected,
                ]}
              >
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Input
          label="Bet Amount (coins)"
          placeholder="Enter amount"
          value={betAmount}
          onChangeText={setBetAmount}
          keyboardType="numeric"
        />
        
        <View style={styles.betFormFooter}>
          <View style={styles.availableCoins}>
            <Text style={styles.availableCoinsLabel}>Available:</Text>
            <Text style={styles.availableCoinsValue}>{userGroupCoins} coins</Text>
          </View>
          
          <Button
            title="Place Bet"
            onPress={handlePlaceBet}
            isLoading={isLoading}
            disabled={!selectedOption || isLoading}
          />
        </View>
      </Card>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.customHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{bet.title}</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.betInfoCard}>
          <View style={styles.betHeader}>
            <View style={styles.betType}>
              <Trophy size={16} color={colors.primary} />
              <Text style={styles.betTypeText}>
                {bet.type.charAt(0).toUpperCase() + bet.type.slice(1)} Bet
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.groupButton}
              onPress={() => router.push(`/groups/${bet.groupId}`)}
            >
              <Users size={16} color={colors.text} />
              <Text style={styles.groupButtonText}>{group?.name || 'Group'}</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.betTitle}>{bet.title}</Text>
          
          {bet.description && (
            <Text style={styles.betDescription}>{bet.description}</Text>
          )}
          
          <View style={styles.betMeta}>
            <View style={styles.betMetaItem}>
              <Clock size={16} color={colors.textSecondary} />
              <Text style={styles.betMetaText}>
                {new Date(bet.createdAt).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.betMetaItem}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text style={styles.betMetaText}>
                Ends: {new Date(bet.endDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card>
        
        {renderBetForm()}
        
        <Card style={styles.participantsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Participants</Text>
            <View style={styles.participantsCount}>
              <Users size={16} color={colors.textSecondary} />
              <Text style={styles.participantsCountText}>{participations.length}</Text>
            </View>
          </View>
          
          {participations.length > 0 ? (
            participations.map((participation) => (
              <View key={participation.id} style={styles.participantItem}>
                <View style={styles.participantInfo}>
                  <Avatar name={participation.userId} size={36} />
                  <View style={styles.participantDetails}>
                    <Text style={styles.participantName}>
                      {participation.userId === user.id ? 'You' : participation.userId}
                    </Text>
                    <Text style={styles.participantChoice}>{participation.optionId}</Text>
                  </View>
                </View>
                <View style={styles.participantAmount}>
                  <Coins size={16} color={colors.primary} />
                  <Text style={styles.participantAmountText}>{participation.amount}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyParticipants}>
              <Text style={styles.emptyParticipantsText}>
                No participants yet. Be the first to bet!
              </Text>
            </View>
          )}
        </Card>
        
        <Card style={styles.statsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Bet Statistics</Text>
            <BarChart size={20} color={colors.textSecondary} />
          </View>
          
          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Pot</Text>
              <Text style={styles.statValue}>
                {participations.reduce((sum, p) => sum + p.amount, 0)} coins
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Average Bet</Text>
              <Text style={styles.statValue}>
                {participations.length > 0 
                  ? Math.round(participations.reduce((sum, p) => sum + p.amount, 0) / participations.length) 
                  : 0} coins
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Highest Bet</Text>
              <Text style={styles.statValue}>
                {participations.length > 0 
                  ? Math.max(...participations.map(p => p.amount))
                  : 0} coins
              </Text>
            </View>
          </View>
          
          <View style={styles.optionsDistribution}>
            <Text style={styles.optionsDistributionTitle}>Options Distribution</Text>
            
            {bet.options.map((option, index) => {
              const optionParticipations = participations.filter(p => p.optionId === String(option.text));
              const percentage = participations.length > 0 
                ? Math.round((optionParticipations.length / participations.length) * 100) 
                : 0;
              
              return (
                <View key={typeof option.text === 'string' && option.text.length > 0 ? option.text : `option-${index}`} style={styles.distributionItem}>
                  <View style={styles.distributionHeader}>
                    <Text style={styles.distributionLabel}>{option.text}</Text>
                    <Text style={styles.distributionPercentage}>{percentage}%</Text>
                  </View>
                  <View style={styles.distributionBar}>
                    <View 
                      style={[
                        styles.distributionProgress, 
                        { width: `${percentage}%` }
                      ]} 
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerRight: {
    width: 32,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  notFoundText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  betInfoCard: {
    marginBottom: 16,
    padding: 16,
  },
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  betType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  betTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 4,
  },
  groupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  groupButtonText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 4,
  },
  betTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  betDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  betMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  betMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  betMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  betFormCard: {
    marginBottom: 16,
    padding: 16,
  },
  betFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
  },
  optionsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  optionButtonTextSelected: {
    color: '#FFFFFF',
  },
  betFormFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  availableCoins: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableCoinsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 4,
  },
  availableCoinsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  betPlacedCard: {
    marginBottom: 16,
    padding: 16,
  },
  betPlacedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  betPlacedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  betPlacedDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  betPlacedLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  betPlacedValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  participantsCard: {
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  participantsCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsCountText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantDetails: {
    marginLeft: 12,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  participantChoice: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  participantAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
  },
  emptyParticipants: {
    padding: 16,
    alignItems: 'center',
  },
  emptyParticipantsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsCard: {
    padding: 16,
  },
  statsContent: {
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  optionsDistribution: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  optionsDistributionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
  },
  distributionItem: {
    marginBottom: 12,
  },
  distributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  distributionLabel: {
    fontSize: 14,
    color: colors.text,
  },
  distributionPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  distributionBar: {
    height: 8,
    backgroundColor: colors.cardLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionProgress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
});
