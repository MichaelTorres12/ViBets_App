// components/group/GroupChallenges.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import {
  Plus,
  Trophy,
  Award,
  ArrowDown,
  ArrowUp,
  Filter,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { ChallengeCard } from '@/components/ChallengeCard';
import { Group, Challenge, ChallengeStatus } from '@/types';
import { useChallengesStore } from '@/store/challenges-store';
import { useAuth } from '@/store/auth-context';

interface GroupChallengesProps {
  group: Group;
}

export function GroupChallenges({ group }: GroupChallengesProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  const [tab, setTab] = useState<'all' | 'my'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'open' | 'completed' | 'expired'
  >('open');

  const { challenges, loading, fetchGroupChallenges } = useChallengesStore();
  const { user } = useAuth();

  /* ------------------------------------------------------------------- */
  /*                               EFFECTS                               */
  /* ------------------------------------------------------------------- */
  useEffect(() => {
    fetchGroupChallenges(group.id);
  }, [group.id]);

  /* ------------------------------------------------------------------- */
  /*                               FILTERS                               */
  /* ------------------------------------------------------------------- */
  const statusOptions = [
    { label: t('all') || 'All', value: 'all', icon: Filter },
    { label: t('active') || 'Active', value: 'active', icon: CheckCircle },
    { label: t('completed') || 'Completed', value: 'completed', icon: Trophy },
    { label: t('expired') || 'Expired', value: 'expired', icon: XCircle },
  ] as const;

  const sortedAndFilteredChallenges = useMemo(() => {
    let list =
      tab === 'all'
        ? challenges.filter((c) => c.groupId === group.id)
        : challenges.filter(
            (c) =>
              c.groupId === group.id &&
              (c.createdBy === user?.id ||
                // compatibilidad con posibles campos legacy
                // @ts-ignore
                c.creator_id === user?.id)
          );

    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter);
    }

    return [...list].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
    });
  }, [tab, statusFilter, sortOrder, challenges, group.id, user?.id]);

  /* ------------------------------------------------------------------- */
  /*                               ACTIONS                               */
  /* ------------------------------------------------------------------- */
  const toggleSortOrder = () =>
    setSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'));

  const handleCreateChallenge = () =>
    router.push(`/groups/${group.id}/create-challenge`);

  const handleParticipate = (challenge: Challenge) => {
    router.push(`/groups/${group.id}/challenge/${challenge.id}`);
  };

  /* ------------------------------------------------------------------- */
  /*                                RENDER                               */
  /* ------------------------------------------------------------------- */
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {(['all', 'my'] as const).map((key) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.tabButton,
                tab === key && [
                  styles.activeTabButton,
                  { borderBottomColor: colors.primary },
                ],
              ]}
              onPress={() => setTab(key)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: tab === key ? colors.primary : colors.textSecondary,
                  },
                ]}
              >
                {key === 'all'
                  ? t('allChallenges') || 'All Challenges'
                  : t('myChallengesCreated') || 'Created by me'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Title & actions */}
        <View style={styles.headerActions}>
          <Text style={[styles.fixedTitle, { color: colors.text }]}>
            {t('allChallenges') || 'All Challenges'}
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.cardLight }]}
              onPress={toggleSortOrder}
            >
              {sortOrder === 'desc' ? (
                <ArrowDown size={18} color={colors.primary} />
              ) : (
                <ArrowUp size={18} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.newChallengeButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleCreateChallenge}
            >
              <Plus size={16} color={colors.textInverted} />
              <Text
                style={[styles.newChallengeText, { color: colors.textInverted }]}
              >
                {t('newChallenge') || 'New Challenge'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersPanel}
        >
          <View style={styles.filtersRow}>
            {statusOptions.map((o) => {
              const isActive = statusFilter === o.value;
              const Icon = o.icon;
              return (
                <TouchableOpacity
                  key={o.value}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive
                        ? colors.primary
                        : colors.cardLight,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() =>
                    setStatusFilter(
                      o.value as 'all' | 'open' | 'completed' | 'expired'
                    )
                  }
                >
                  <Icon
                    size={16}
                    color={isActive ? colors.textInverted : colors.text}
                    style={styles.filterIcon}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color: isActive ? colors.textInverted : colors.text,
                      },
                    ]}
                  >
                    {o.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* LIST */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('loading') || 'Loading challenges…'}
          </Text>
        </View>
      ) : sortedAndFilteredChallenges.length > 0 ? (
        <FlatList
          data={sortedAndFilteredChallenges}
          renderItem={({ item }) => (
            <ChallengeCard challenge={item} onPress={() => handleParticipate(item)} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.challengesList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconContainer,
              { backgroundColor: `${colors.primary}15` },
            ]}
          >
            <Trophy size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {tab === 'all'
              ? t('noChallenges') || 'No challenges yet'
              : t('noCreatedChallenges') ||
                "You haven't created any challenges yet"}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            {tab === 'all'
              ? t('createFirstChallengeMessage') ||
                'Create the first challenge for your group members!'
              : t('createYourFirstChallengeMessage') ||
                'Create your first challenge and invite group members!'}
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={handleCreateChallenge}
          >
            <Plus size={16} color={colors.textInverted} />
            <Text
              style={[styles.createButtonText, { color: colors.textInverted }]}
            >
              {t('createChallenge') || 'Create Challenge'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/* ----------------------------------------------------------------------- */
/*                                   STYLES                                */
/* ----------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  tabsContainer: { flexDirection: 'row', marginBottom: 16 },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: { borderBottomWidth: 2 },
  tabText: { fontSize: 15, fontWeight: '600' },
  fixedTitle: { fontSize: 20, fontWeight: 'bold' },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filtersPanel: { marginBottom: 12 },
  filtersRow: { flexDirection: 'row', paddingVertical: 4, gap: 10 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  filterIcon: { marginRight: 6 },
  filterChipText: { fontSize: 14, fontWeight: '500' },
  newChallengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  newChallengeText: { marginLeft: 6, fontWeight: '600' },
  challengesList: { padding: 16, paddingTop: 8, gap: 12 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  emptyText: { fontSize: 16, textAlign: 'center' },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  createButtonText: { marginLeft: 8, fontWeight: '600', fontSize: 15 },
});
