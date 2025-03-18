import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Plus, Trophy, Clock, Award } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Group } from '@/types';

interface GroupChallengesProps {
  group: Group;
}

// Desafío de ejemplo para mockup UI
interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: 'active' | 'completed' | 'expired';
  dueDate: string;
  participants: number;
}

export function GroupChallenges({ group }: GroupChallengesProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [tab, setTab] = useState<'all' | 'my'>('all');

  // Datos de ejemplo para mostrar UI
  const mockChallenges: Challenge[] = [
    {
      id: '1',
      title: 'Run 5km this week',
      description: 'Complete a 5km run and share screenshot proof from your fitness app',
      reward: 100,
      status: 'active',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      participants: 3
    },
    {
      id: '2',
      title: 'No sugar for 3 days',
      description: 'Avoid all sugary foods and drinks for three consecutive days',
      reward: 50,
      status: 'active',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      participants: 5
    }
  ];

  const renderChallengeCard = ({ item }: { item: Challenge }) => (
    <Card style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <Text style={[styles.challengeTitle, { color: colors.text }]}>{item.title}</Text>
        <View style={[styles.rewardBadge, { backgroundColor: colors.primary }]}>
          <Trophy size={14} color="#FFFFFF" />
          <Text style={styles.rewardText}>{item.reward}</Text>
        </View>
      </View>
      
      <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.challengeFooter}>
        <View style={styles.dueDateContainer}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={[styles.dueDate, { color: colors.textSecondary }]}>
            {new Date(item.dueDate).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.participantsContainer}>
          <Award size={14} color={colors.textSecondary} />
          <Text style={[styles.participants, { color: colors.textSecondary }]}>
            {item.participants} {t('participants') || 'participants'}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.actionButton, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.actionButtonText}>
          {t('participate') || 'Participate'}
        </Text>
      </TouchableOpacity>
    </Card>
  );

  const handleCreateChallenge = () => {
    // Implementar navegación a pantalla de creación de desafíos
  };

  return (
    <View style={styles.container}>
      {/* Tabs para filtrar desafíos */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, tab === 'all' && styles.activeTabButton]}
          onPress={() => setTab('all')}
        >
          <Text style={[styles.tabText, { color: tab === 'all' ? colors.primary : colors.textSecondary }]}>
            {t('allChallenges') || 'All Challenges'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, tab === 'my' && styles.activeTabButton]}
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
      {mockChallenges.length > 0 ? (
        <FlatList
          data={mockChallenges}
          renderItem={renderChallengeCard}
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
  challengeCard: {
    padding: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  rewardText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDate: {
    fontSize: 12,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participants: {
    fontSize: 12,
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
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
  }
}); 