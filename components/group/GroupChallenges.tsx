// components/group/GroupChallenges.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Plus } from 'lucide-react-native';
import { ChallengeCard } from '@/components/ChallengeCard';
import { Group, Challenge } from '@/types';
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
  const { challenges, loading, fetchGroupChallenges } = useChallengesStore();
  const { user } = useAuth();

  // Cargar los desafíos del grupo al montar el componente
  useEffect(() => {
    fetchGroupChallenges(group.id);
  }, [group.id]);

  // Filtrar desafíos según la pestaña activa
  const filteredChallenges = tab === 'all' 
    ? challenges.filter(challenge => challenge.group_id === group.id)
    : challenges.filter(challenge => 
        challenge.group_id === group.id && 
        challenge.participants?.some(p => p.userId === user?.id)
      );

  const handleCreateChallenge = () => {
    router.push(`/groups/${group.id}/create-challenge`);
  };

  const handleParticipate = (challenge: Challenge) => {
    const alreadyParticipates = challenge.participants?.some(p => p.userId === user?.id);
    
    if (alreadyParticipates) {
      Alert.alert(
        t('alreadyParticipating') || 'Already Participating',
        t('alreadyParticipatingMessage') || 'You are already participating in this challenge'
      );
      return;
    }
    
    if (challenge.status !== 'open') {
      Alert.alert(
        t('challengeClosed') || 'Challenge Closed',
        t('challengeClosedMessage') || 'This challenge is no longer open for participation'
      );
      return;
    }
    
    router.push(`/groups/${group.id}/challenge/${challenge.id}`);
  };

  return (
    <View style={styles.container}>
      {/* Tabs para filtrar desafíos */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, tab === 'all' && [styles.activeTabButton, { borderBottomColor: colors.primary }]]}
          onPress={() => setTab('all')}
        >
          <Text style={[styles.tabText, { color: tab === 'all' ? colors.primary : colors.textSecondary }]}>
            {t('allChallenges') || 'All Challenges'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, tab === 'my' && [styles.activeTabButton, { borderBottomColor: colors.primary }]]}
          onPress={() => setTab('my')}
        >
          <Text style={[styles.tabText, { color: tab === 'my' ? colors.primary : colors.textSecondary }]}>
            {t('myChallenges') || 'My Challenges'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Botón para crear desafío */}
      <TouchableOpacity style={styles.newChallengeButton} onPress={handleCreateChallenge}>
        <Plus size={16} color="#000" />
        <Text style={styles.newChallengeText}>{t('newChallenge') || 'New Challenge'}</Text>
      </TouchableOpacity>

      {/* Lista de desafíos */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('loading') || 'Loading challenges...'}
          </Text>
        </View>
      ) : filteredChallenges.length > 0 ? (
        <FlatList
          data={filteredChallenges}
          renderItem={({ item }) => (
            <ChallengeCard 
              challenge={item} 
              onPress={() => handleParticipate(item)} 
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.challengesList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('noChallenges') || 'No challenges yet'}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            {t('createFirstChallenge') || 'Create your first challenge!'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  newChallengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#FFD60A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  newChallengeText: {
    marginLeft: 6,
    color: '#000',
    fontWeight: '600',
  },
  challengesList: {
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
