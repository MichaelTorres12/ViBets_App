import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '@/constants/colors';
import { Group } from '@/types';
import { Avatar } from './Avatar';
import { Users, ArrowRight } from 'lucide-react-native';
import { formatDate } from '@/utils/helpers';
import { Card } from './Card';

interface GroupCardProps {
  group: Group;
  onPress: (group: Group) => void;
  compact?: boolean;
}

export const GroupCard: React.FC<GroupCardProps> = ({ 
  group, 
  onPress,
  compact = false
}) => {
  // Calculate total group coins
  const totalGroupCoins = group.members.reduce((total, member) => total + member.groupCoins, 0);
  
  // Get current user's coins in this group
  const currentUserCoins = group.members.find(m => m.userId === '1')?.groupCoins || 0;

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={() => onPress(group)}
        activeOpacity={0.7}
      >
        <Avatar 
          uri={group.avatar} 
          name={group.name} 
          size={40} 
        />
        <View style={styles.compactInfo}>
          <Text style={styles.compactName}>{group.name}</Text>
          <View style={styles.compactMembers}>
            <Users size={14} color={colors.textSecondary} />
            <Text style={styles.compactMembersText}>{group.members.length}</Text>
          </View>
        </View>
        <ArrowRight size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(group)}
      activeOpacity={0.7}
    >
      <Card style={styles.container} variant="elevated">
        <View style={styles.header}>
          <Avatar 
            uri={group.avatar} 
            name={group.name} 
            size={50} 
          />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{group.name}</Text>
            <Text style={styles.description} numberOfLines={1}>
              {group.description || 'No description'}
            </Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{group.members.length}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{group.challenges?.length || 0}</Text>
            <Text style={styles.statLabel}>Challenges</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentUserCoins}</Text>
            <Text style={styles.statLabel}>Your Coins</Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Created</Text>
            <Text style={styles.footerValue}>{formatDate(group.createdAt)}</Text>
          </View>
          
          <View style={styles.inviteCode}>
            <Text style={styles.inviteCodeText}>{group.inviteCode}</Text>
          </View>
        </View>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.cardLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    
  },
  footerLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  footerValue: {
    fontSize: 14,
    color: colors.text,
  },
  inviteCode: {
    backgroundColor: colors.cardLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  inviteCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
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
  compactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  compactName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  compactMembers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactMembersText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});