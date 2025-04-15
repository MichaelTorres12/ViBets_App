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
import { useAuth } from '@/store/auth-context';
import { useLanguage } from '@/components/LanguageContext';
import { useGroupsStore } from '@/store/groups-store';
import { useBetsStore } from '@/store/bets-store';
import { GroupCard } from '@/components/GroupCard';
import { BetCard } from '@/components/BetCard';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { YourOpenBetCard } from '@/components/YourOpenBetCard';
import { Plus, Search, Bell, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeContext';  // Asegúrate de importar useTheme si no existe, añádelo

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { colors } = useTheme(); // Usa el hook de tema para obtener los colores actuales

  const { fetchUserBets, bets } = useBetsStore();
  const { getUserGroups, getGroupById } = useGroupsStore();

  useEffect(() => {
    if (user) {
      fetchUserBets(user.id);
    }
  }, [user, fetchUserBets]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchUserBets(user.id);
      }
    }, [user, fetchUserBets])
  );

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Cargando / No hay usuario...</Text>
      </SafeAreaView>
    );
  }

  const userGroups = getUserGroups(user.id);

  const userBets = bets
    .map((bet: any) => {
      const participation = bet.participations?.find(
        (p: any) => p.user_id === user.id && p.status === 'active'
      );
      return { bet, participation };
    })
    .filter(({ bet, participation }) => participation && bet.status === 'open');

  const recentBets = userBets
    .sort(
      (a, b) =>
        new Date(b.bet.createdAt || b.bet.created_at).getTime() -
        new Date(a.bet.createdAt || a.bet.created_at).getTime()
    )
    .slice(0, 5);

  const navigateToGroup = (groupId: string) => {
    router.push(`/groups/${groupId}`);
  };

  const navigateToBet = (betId: string, groupId: string) => {
    router.push(`/groups/${groupId}/bet/${betId}`);
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.headerTop}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/vibets-icon.png')}
            style={styles.logoImage}
          />
          <Text style={[styles.logoText, { color: colors.text }]}>Vi</Text>
          <Text style={[styles.logoTextSecondary, { color: colors.primary }]}>Bets</Text>
        </View>
        <View style={styles.headerActions}>
          {/**
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.card }]}>
            <Search size={24} color={colors.text} />
          </TouchableOpacity>
           */}
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.card }]}>
            <Bell size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderYourOpenBetsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('yourOpenBets') || 'Your Open Bets'}
          </Text>
          <TouchableOpacity 
            style={[styles.gradientPill, { 
              backgroundColor: `${colors.primary}15`, // 15% opacidad 
              borderColor: colors.primary 
            }]}
            onPress={() => router.push('/bets?filter=active')}
          >
            <Text style={[styles.gradientPillText, { color: colors.primary }]}>
              {t('yourOpenBetsActive') || 'Active'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/bets')}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>
              {t('viewAll')}
            </Text>
          </TouchableOpacity>
        </View>
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
                groupName={groupName}
                onPress={() => navigateToBet(item.bet.id, item.bet.group_id)}
              />
            );
          }}
          contentContainerStyle={styles.betsListHorizontal}
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('noYourOpenBets') || 'You have no open bets yet.'}
          </Text>
          {userGroups.length > 0 && (
            <Button
              title={t('createBet') || 'Create Bet'}
              onPress={() => router.push(`/groups/${userGroups[0]?.id}/create-bet`)}
            />
          )}
        </Card>
      )}
    </View>
  );

  const renderYourGroupsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('yourGroups')}
        </Text>
        <TouchableOpacity onPress={() => router.push('/groups')}>
          <Text style={[styles.viewAll, { color: colors.primary }]}>
            {t('viewAll')}
          </Text>
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
              <Text style={[styles.moreButtonText, { color: colors.primary }]}>
                {t('viewMoreGroups')} ({userGroups.length - 2})
              </Text>
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('notInGroups')}
          </Text>
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
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
    borderBottomWidth: 1,
    borderBottomColor: 'transparent', // Efecto sutil de separación
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
    height: 43,
    marginRight: 5,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoTextSecondary: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  betsListHorizontal: {
    paddingVertical: 4, // Espacio para la sombra
    gap: 12,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
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
  },
  gradientPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  gradientPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
