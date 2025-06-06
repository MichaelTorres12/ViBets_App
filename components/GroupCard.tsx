// components/GroupCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { Group } from '@/types';
import { Avatar } from './Avatar';
import { Users, ArrowRight, TrendingUp, Trophy, Calendar, Key, Coins } from 'lucide-react-native';
import { formatDate } from '@/utils/helpers';
import { Card } from './Card';
import { useLanguage } from './LanguageContext';
import { useAuth } from '@/store/auth-context';

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
  const { t } = useLanguage();
  const { user } = useAuth();         // <-- USAR AuthContext
  const { colors, theme } = useTheme();
  const isLight = theme === 'light';

  // Obtener las monedas del usuario actual en este grupo
  const currentUserMember = group.members.find(m => m.userId === user?.id);
  const userCoins = currentUserMember?.groupCoins || 0;

  // Contar apuestas en este grupo (si están disponibles)
  const betsCount = group.bets?.length || 0;

  const challengesCount = group.challenges?.length || 0;

  // Formatear fecha de creación
  const creationDate = formatDate(group.createdAt);

  // Código de invitación
  const inviteCode = group.inviteCode;

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { 
          backgroundColor: colors.card,
          borderWidth: isLight ? 1 : 0,
          borderColor: isLight ? colors.border : 'transparent',
        }]}
        onPress={() => onPress(group)}
        activeOpacity={0.7}
      >
        <Avatar
          uri={group.avatar}
          name={group.name}
          size={40}
        />
        <View style={styles.compactInfo}>
          <Text style={[styles.compactName, { color: colors.text }]}>{group.name}</Text>
          <View style={styles.compactMembers}>
            <Users size={14} color={colors.textSecondary} />
            <Text style={[styles.compactMembersText, { color: colors.textSecondary }]}>
              {group.members.length}
            </Text>
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
            <Text style={[styles.name, { color: colors.text }]}>{group.name}</Text>
            <View style={styles.coinsContainer}>
              <Coins size={16} color={colors.coin} style={styles.coinIcon} />
              <Text style={[styles.coinsText, { color: colors.coin }]}>
                {t('yourCoins')}: {userCoins.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.statsContainer, { 
          backgroundColor: isLight ? colors.cardLight : '#2f3d4d',
          borderWidth: isLight ? 1 : 0,
          borderColor: isLight ? colors.border : 'transparent',
        }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{group.members.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('members')}</Text>
            <Users size={16} color={colors.primary} style={styles.statIcon} />
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{betsCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('bets')}</Text>
            <TrendingUp size={16} color={colors.primary} style={styles.statIcon} />
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{challengesCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('challenges')}</Text>
            <Trophy size={16} color={colors.primary} style={styles.statIcon} />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <View style={styles.footerRow}>
              <Calendar size={14} color={colors.textSecondary} style={styles.footerIcon} />
              <Text style={[styles.footerValue, { color: colors.text }]}>{creationDate}</Text>
            </View>
          </View>

          <View style={[styles.inviteCodeContainer, { 
            backgroundColor: isLight ? 
              `${colors.primary}10` : 
              colors.cardLight,
            borderWidth: isLight ? 1 : 0,
            borderColor: isLight ? `${colors.primary}40` : 'transparent'
          }]}>
            <Key size={14} color={colors.primary} style={styles.inviteIcon} />
            <Text style={[styles.inviteCodeText, { color: colors.primary }]}>{inviteCode}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 16,
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
    marginBottom: 4,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    marginRight: 4,
  },
  coinsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statIcon: {
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    marginRight: 4,
  },
  footerValue: {
    fontSize: 14,
  },
  inviteCodeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteIcon: {
    marginRight: 4,
  },
  inviteCodeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  compactMembers: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  compactMembersText: {
    fontSize: 12,
    marginLeft: 4,
  },
});
