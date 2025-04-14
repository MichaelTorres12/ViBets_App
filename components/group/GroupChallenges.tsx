// components/group/GroupChallenges.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Plus, Trophy, Award } from 'lucide-react-native';
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabecera con tabs y botón de nuevo desafío */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        {/* Tabs para filtrar desafíos */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              tab === 'all' && [
                styles.activeTabButton, 
                { borderBottomColor: colors.primary }
              ]
            ]}
            onPress={() => setTab('all')}
          >
            <Text style={[
              styles.tabText, 
              { color: tab === 'all' ? colors.primary : colors.textSecondary }
            ]}>
              {t('allChallenges') || 'All Challenges'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              tab === 'my' && [
                styles.activeTabButton, 
                { borderBottomColor: colors.primary }
              ]
            ]}
            onPress={() => setTab('my')}
          >
            <Text style={[
              styles.tabText, 
              { color: tab === 'my' ? colors.primary : colors.textSecondary }
            ]}>
              {t('myChallenges') || 'My Challenges'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}> 

          <Text style={[styles.fixedTitle, { color: colors.text }]}>
            {t('allChallenges') || 'All Challenges'}
          </Text>

          {/* Botón para crear desafío */}
          <TouchableOpacity 
            style={[
              styles.newChallengeButton, 
              { 
                backgroundColor: colors.primary,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 3
              }
            ]} 
            onPress={handleCreateChallenge}
          >
            <Plus size={16} color={colors.textInverted} />
            <Text style={[styles.newChallengeText, { color: colors.textInverted }]}>
              {t('newChallenge') || 'New Challenge'}
            </Text>
          </TouchableOpacity>
        </View>


      </View>

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
          <View style={[styles.emptyIconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <Trophy size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {t('noChallenges') || 'No challenges yet'}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            {t('createFirstChallengeMessage') || 'Create the first challenge for your group members to complete and earn rewards!'}
          </Text>
          <TouchableOpacity 
            style={[styles.createButton, { backgroundColor: colors.primary }]} 
            onPress={handleCreateChallenge}
          >
            <Plus size={16} color={colors.textInverted} />
            <Text style={[styles.createButtonText, { color: colors.textInverted }]}>
              {t('createChallenge') || 'Create Challenge'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
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
    fontSize: 15,
    fontWeight: '600',
  },
  fixedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  newChallengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  newChallengeText: {
    marginLeft: 6,
    fontWeight: '600',
  },
  challengesList: {
    padding: 16,
    paddingTop: 8,
    gap: 12,
  },
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  createButtonText: {
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 15,
  },
});
