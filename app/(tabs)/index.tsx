// app/(tabs)/index.tsx
import React, { useEffect, useCallback } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useGroupsStore } from '@/store/groups-store';
import { useBetsStore } from '@/store/bets-store';
import { useLanguage } from '@/components/LanguageContext';
import { GroupCard } from '@/components/GroupCard';
import { BetCard } from '@/components/BetCard';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { YourOpenBetCard } from '@/components/YourOpenBetCard';
import { Plus, Search, Bell, ArrowRight } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { getUserGroups } = useGroupsStore();
  const { participations, fetchUserBets, getBetById, bets } = useBetsStore();
  const { t } = useLanguage();
  const { getGroupById } = useGroupsStore(); 

  if (!user) return null;

  // Llamamos a fetchUserBets al montar y cada vez que la pantalla obtiene foco.
  useEffect(() => {
    fetchUserBets(user.id);
  }, [user, fetchUserBets]);

  useFocusEffect(
    useCallback(() => {
      // Cada vez que la pantalla se enfoque, se refrescan las apuestas del usuario.
      fetchUserBets(user.id);
    }, [user.id, fetchUserBets])
  );

  const userGroups = getUserGroups(user.id);

  // Calculamos las apuestas del usuario directamente desde el store "bets".
  const userBets = bets
    .map((bet: any) => {
      const participation = bet.participations?.find(
        (p: any) => p.user_id === user.id && p.status === 'active'
      );
      return { bet, participation };
    })
    .filter(({ bet, participation }) => participation && bet.status === 'open');

  // Ordenamos las apuestas por fecha descendente y tomamos solo las 5 más recientes.
  const recentBets = userBets
    .sort(
      (a, b) =>
        new Date(b.bet.createdAt || b.bet.created_at).getTime() -
        new Date(a.bet.createdAt || a.bet.created_at).getTime()
    )
    .slice(0, 5);
  console.log('Your Open Bets:', recentBets);

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

  // Sección "Your Open Bets" en horizontal (limitada a 5 apuestas recientes)
  const renderYourOpenBetsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {t('yourOpenBets') || 'Your Open Bets'}
        </Text>
        <TouchableOpacity onPress={() => router.push('/bets')}>
          <Text style={styles.viewAll}>{t('viewAll')}</Text>
        </TouchableOpacity>
      </View>

      {recentBets.length > 0 ? (
        <FlatList
          data={recentBets}
          horizontal
          keyExtractor={({ participation }) => participation.id}
          renderItem={({ item }) => {
            const group = getGroupById(item.bet.group_id);
            const groupName = group ? group.name : 'Unknown Group';

            return (
              <YourOpenBetCard
                bet={item.bet}
                userParticipation={item.participation}
                groupName={groupName}      // <<----  Aquí pasamos el nombre
                onPress={() => navigateToBet(item.bet.id, item.bet.group_id)}
              />
            );
          }}
          contentContainerStyle={styles.betsListHorizontal}
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            {t('noYourOpenBets') || 'You have no open bets yet.'}
          </Text>
          {userGroups.length > 0 && (
            <Button
              title={t('createBet') || 'Create Bet'}
              onPress={() =>
                router.push(`/groups/${userGroups[0]?.id}/create-bet`)
              }
            />
          )}
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
        {renderYourOpenBetsSection()}
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
  betsListHorizontal: {
    gap: 12,
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
