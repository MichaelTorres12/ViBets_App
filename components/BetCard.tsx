//components/BetCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '@/constants/colors';
import { Bet, BetParticipation } from '@/types';
import { calculateTimeLeft, formatCurrency } from '@/utils/helpers';
import { Clock, Users, Trophy, ArrowRight } from 'lucide-react-native';
import { Card } from './Card';
import { LinearGradient } from 'expo-linear-gradient';

interface BetCardProps {
  bet: Bet;
  participations?: BetParticipation[];
  userParticipation?: BetParticipation;
  onPress: (bet: Bet) => void;
  compact?: boolean;
}

export const BetCard: React.FC<BetCardProps> = ({
  bet,
  participations = [],
  userParticipation,
  onPress,
  compact = false,
}) => {
  const totalPot = participations.reduce((sum, p) => sum + p.amount, 0);
  const timeLeft = calculateTimeLeft(bet.endDate as string);

  
  const getStatusColor = () => {
    switch (bet.status) {
      case 'open':
        return colors.primary;
      case 'closed':
        return colors.warning;
      case 'settled':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };
  
  const getStatusText = () => {
    switch (bet.status) {
      case 'open':
        return 'LIVE';
      case 'closed':
        return 'CLOSED';
      case 'settled':
        return 'SETTLED';
      default:
        return '';
    }
  };
  
  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={() => onPress(bet)}
        activeOpacity={0.7}
      >
        <View style={styles.compactContent}>
          <View style={styles.compactHeader}>
            <Text style={styles.compactTitle} numberOfLines={1}>{bet.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
          </View>
          
          <View style={styles.compactFooter}>
            <View style={styles.compactInfo}>
              <Clock size={14} color={colors.textSecondary} />
              <Text style={styles.compactInfoText}>{timeLeft}</Text>
            </View>
            <View style={styles.compactInfo}>
              <Trophy size={14} color={colors.textSecondary} />
              <Text style={styles.compactInfoText}>${formatCurrency(totalPot)}</Text>
            </View>
          </View>
        </View>
        <ArrowRight size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity
      onPress={() => onPress(bet)}
      activeOpacity={0.7}
    >
      <Card style={styles.container} variant="elevated">
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {bet.title}
            </Text>
            {bet.description && (
              <Text style={styles.description} numberOfLines={1}>
                {bet.description}
              </Text>
            )}
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>
        
        <View style={styles.optionsPreview}>
          {bet.options.slice(0, 2).map((option, index) => {
            const optionParticipations = participations.filter(p => p.optionId === option.id);
            const optionTotal = optionParticipations.reduce((sum, p) => sum + p.amount, 0);
            const percentage = totalPot > 0 ? (optionTotal / totalPot) * 100 : 0;
            
            return (
              <View key={option.id} style={styles.optionItem}>
                <View style={styles.optionHeader}>
                  <Text style={styles.optionText}>{option.text}</Text>
                  <Text style={styles.optionOdds}>
                    {(1 + (percentage > 0 ? 100/percentage : 1)).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${percentage}%` },
                      bet.settledOption === option.id && styles.progressBarWinner,
                    ]} 
                  />
                </View>
              </View>
            );
          })}
          
          {bet.options.length > 2 && (
            <Text style={styles.moreOptions}>+{bet.options.length - 2} more options</Text>
          )}
        </View>
        
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <View style={styles.infoItem}>
              <Clock size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>{timeLeft}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Users size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>{participations.length} bets</Text>
            </View>
          </View>
          
          <View style={styles.potContainer}>
            <Text style={styles.potLabel}>Pot</Text>
            <Text style={styles.potAmount}>${formatCurrency(totalPot)}</Text>
          </View>
        </View>
        
        {userParticipation && (
          <View style={styles.userBetContainer}>
            <Text style={styles.userBetLabel}>Your bet:</Text>
            <View style={styles.userBetDetails}>
              <Text style={styles.userBetOption}>
                {bet.options.find(o => o.id === userParticipation.optionId)?.text}
              </Text>
              <Text style={styles.userBetAmount}>${formatCurrency(userParticipation.amount)}</Text>
            </View>
            
            {userParticipation.status !== 'active' && (
              <View style={[
                styles.userBetStatus,
                userParticipation.status === 'won' ? styles.userBetWon : styles.userBetLost
              ]}>
                <Text style={styles.userBetStatusText}>
                  {userParticipation.status === 'won' ? 'WON' : 'LOST'}
                </Text>
              </View>
            )}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  optionsPreview: {
    marginBottom: 16,
  },
  optionItem: {
    marginBottom: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  optionOdds: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.cardLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressBarWinner: {
    backgroundColor: colors.success,
  },
  moreOptions: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  potContainer: {
    alignItems: 'flex-end',
  },
  potLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  potAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  userBetContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  userBetLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  userBetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userBetOption: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  userBetAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  userBetStatus: {
    position: 'absolute',
    right: 0,
    top: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userBetWon: {
    backgroundColor: colors.success,
  },
  userBetLost: {
    backgroundColor: colors.error,
  },
  userBetStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  compactContent: {
    flex: 1,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  compactFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  compactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});