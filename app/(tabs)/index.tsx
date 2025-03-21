// app/(tabs)/index.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useGroupsStore } from '@/store/groups-store';
import { useBetsStore } from '@/store/bets-store';
import { useLanguage } from '@/components/LanguageContext';
import { CoinDisplay } from '@/components/CoinDisplay';
import { GroupCard } from '@/components/GroupCard';
import { BetCard } from '@/components/BetCard';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import {
  Plus,
  TrendingUp,
  ChevronRight,
  Search,
  Bell,
  ArrowRight,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bet, BetParticipation } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { getUserGroups } = useGroupsStore();
  const { bets, participations, getBetById } = useBetsStore();
  const { t } = useLanguage();

  if (!user) {
    return null;
  }

  const userGroups = getUserGroups(user.id);

  // Obtener trending bets (últimas 5 abiertas)
  const trendingBets = bets
    .filter((bet) => bet.status === 'open')
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  // Obtener las apuestas activas del usuario
  const userBets: Array<{ bet: Bet | undefined; participation: BetParticipation }> =
    participations
      .filter((p) => p.userId === user.id && p.status === 'active')
      .map((p) => {
        const bet = getBetById(p.betId);
        return { participation: p, bet };
      });

  const navigateToGroup = (groupId: string) => {
    router.push(`/groups/${groupId}`);
  };

  // Navega a /groups/[groupId]/bet/[betId]
  const navigateToBet = (betId: string, groupId: string) => {
    router.push(`/groups/${groupId}/bet/${betId}`);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.logoContainer}>
          {/* Logo a la izquierda */}
          <Image
            source={require('../../assets/images/ghostIcon.png')}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>Vi</Text>
          <Text style={styles.logoText}>Bets</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderTrendingSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('trending')}</Text>
        <TouchableOpacity onPress={() => router.push('/bets')}>
          <Text style={styles.viewAll}>{t('viewAll')}</Text>
        </TouchableOpacity>
      </View>

      {trendingBets.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingScroll}
        >
{trendingBets.map((bet) => {
  // Obtener el grupo correspondiente usando el group_id de la apuesta
  const groupForBet = userGroups.find((g) => g.id === bet.group_id);

  // Calcular si la apuesta ya terminó
  const now = Date.now();
  const endTime = bet.end_date ? new Date(bet.end_date).getTime() : 0;
  const isEnded = endTime <= now;
  // Si la apuesta está en "open" pero ya terminó, cambiamos el status a "closed"
  const localStatus =
    bet.status === 'open' && isEnded ? 'closed' : bet.status ?? 'unknown';

  // Función para obtener el badge según el estado, similar a BetCard
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return { label: t('open'), bgColor: '#FFD60A', color: '#000' };
      case 'closed':
        return { label: t('closed'), bgColor: '#F44336', color: '#fff' };
      case 'settled':
        return { label: t('settled'), bgColor: '#9E9E9E', color: '#fff' };
      default:
        return { label: t('unknown'), bgColor: '#777', color: '#fff' };
    }
  };

  const { label: statusLabel, bgColor: statusColor } = getStatusBadge(localStatus);

  return (
    <TouchableOpacity
      key={bet.id}
      style={styles.trendingCard}
      onPress={() => navigateToBet(bet.id, bet.group_id)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)']}
        style={styles.trendingGradient}
      >
        <View style={styles.trendingContent}>
          <View style={styles.trendingTopRow}>
            {/* Nombre del grupo en extremo izquierdo */}
            <Text style={styles.trendingGroupText}>
              {groupForBet?.name || ''}
            </Text>
            {/* Badge con el estado recalculado */}
            <View
              style={[
                styles.trendingBadge,
                { backgroundColor: statusColor },
              ]}
            >
              <Text
                style={[
                  styles.trendingBadgeText,
                  {
                    color: statusColor === '#FFD60A' ? '#000' : '#fff',
                  },
                ]}
              >
                {statusLabel}
              </Text>
            </View>
          </View>
          <Text style={styles.trendingTitle} numberOfLines={2}>
            {bet.title}
          </Text>
          <View style={styles.trendingFooter}>
            <Text style={styles.trendingPot}>
              {t('pot')}: $
              {participations
                .filter((p) => p.betId === bet.id)
                .reduce((sum, p) => sum + p.amount, 0)
                .toLocaleString()}
            </Text>
            <Button
              title={t('betNow')}
              size="small"
              rounded
              style={styles.trendingButton}
              onPress={() => navigateToBet(bet.id, bet.group_id)}
            />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
})}

        </ScrollView>
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('noTrendingBets')}</Text>
        </Card>
      )}
    </View>
  );

  const renderYourGroupsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('yourGroups')}</Text>
        <TouchableOpacity onPress={() => router.push('/groups')}>
          <Text style={styles.viewAll}>{t('viewAll')}</Text>
        </TouchableOpacity>
      </View>

      {userGroups.length > 0 ? (
        <View>
          {userGroups.slice(0, 2).map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onPress={() => navigateToGroup(group.id)}
            />
          ))}
          {userGroups.length > 2 && (
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => router.push('/groups')}
            >
              <Text style={styles.moreButtonText}>
                {t('viewMoreGroups')} ({userGroups.length - 2})
              </Text>
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('notInGroups')}</Text>
          <View style={styles.emptyActions}>
            <Button
              title={t('createGroup')}
              style={styles.emptyButton}
              onPress={() => router.push('/groups/create')}
            />
            <Button
              title={t('joinGroup')}
              variant="outline"
              style={styles.emptyButton}
              onPress={() => router.push('/groups/join')}
            />
          </View>
        </Card>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderTrendingSection()}
        {renderYourGroupsSection()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding for tab bar
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  logoImage: {
    width: 45,
    height: 40,
    marginRight: 5,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  viewAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  trendingScroll: {
    paddingRight: 16,
  },
  trendingCard: {
    width: 280,
    height: 180,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  trendingGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  trendingContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  trendingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingGroupText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  trendingBadge: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trendingBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  trendingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginVertical: 8,
  },
  trendingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingPot: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  trendingButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    minWidth: 150,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  moreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});
