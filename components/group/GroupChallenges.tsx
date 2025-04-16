// components/group/GroupChallenges.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Plus, Trophy, Award, ArrowDown, ArrowUp, Filter, CalendarClock, CheckCircle, XCircle } from 'lucide-react-native';
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

  // Nuevos estados para filtrado y ordenación
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // desc = más recientes primero
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('active');

  // Define las opciones de filtro
  const statusOptions = [
    { label: t('all') || 'All', value: 'all', icon: Filter },
    { label: t('active') || 'Active', value: 'active', icon: CheckCircle },
    { label: t('expired') || 'Expired', value: 'expired', icon: XCircle }
  ];

  // Cargar los desafíos del grupo al montar el componente
  useEffect(() => {
    fetchGroupChallenges(group.id);
  }, [group.id]);

  // Función para ordenar y filtrar los desafíos
  const getSortedAndFilteredChallenges = () => {
    // Primero filtramos por la pestaña activa (todos o mis desafíos creados)
    let filtered = tab === 'all' 
      ? challenges.filter(challenge => challenge.group_id === group.id)
      : challenges.filter(challenge => {
          // Verificamos que el desafío sea parte del grupo actual
          if (challenge.group_id !== group.id) return false;
          
          // Verificamos si el usuario actual es el creador del desafío
          // usando tanto created_by como creator_id para mayor compatibilidad
          return (
            challenge.created_by === user?.id || 
            challenge.creator_id === user?.id
          );
        });
    
    // Luego filtramos por estado si no es "all"
    if (statusFilter !== 'all') {
      filtered = filtered.filter(challenge => {
        const endDate = new Date(challenge.end_date);
        const now = new Date();
        const isExpired = endDate < now;
        
        return statusFilter === 'active' ? !isExpired : isExpired;
      });
    }
    
    // Ordenamos por fecha
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt).getTime();
      const dateB = new Date(b.created_at || b.createdAt).getTime();
      
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  };

  // Obtener los desafíos ordenados y filtrados
  const sortedAndFilteredChallenges = getSortedAndFilteredChallenges();

  // Función para alternar el orden
  const toggleSortOrder = () => {
    setSortOrder(current => current === 'desc' ? 'asc' : 'desc');
  };

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
              {t('myChallengesCreated') || 'Created by me'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerActions}>
          <Text style={[styles.fixedTitle, { color: colors.text }]}>
            {t('allChallenges') || 'All Challenges'}
          </Text>

          <View style={styles.actionButtons}>
            {/* Mantener el botón para ordenar */}
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

            {/* Botón para crear desafío */}
            <TouchableOpacity 
              style={[styles.newChallengeButton, { backgroundColor: colors.primary }]} 
              onPress={handleCreateChallenge}
            >
              <Plus size={16} color={colors.textInverted} />
              <Text style={[styles.newChallengeText, { color: colors.textInverted }]}>
                {t('newChallenge') || 'New Challenge'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mostrar los filtros siempre, sin condición */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersPanel}
        >
          <View style={styles.filtersRow}>
            {statusOptions.map(option => {
              const isActive = statusFilter === option.value;
              const IconComponent = option.icon;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? colors.primary : colors.cardLight,
                      borderColor: isActive ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => setStatusFilter(option.value as 'all' | 'active' | 'expired')}
                >
                  <IconComponent 
                    size={16} 
                    color={isActive ? colors.textInverted : colors.text} 
                    style={styles.filterIcon} 
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: isActive ? colors.textInverted : colors.text }
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Lista de desafíos */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('loading') || 'Loading challenges...'}
          </Text>
        </View>
      ) : sortedAndFilteredChallenges.length > 0 ? (
        <FlatList
          data={sortedAndFilteredChallenges}
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
            {tab === 'all' 
              ? (t('noChallenges') || 'No challenges yet')
              : (t('noCreatedChallenges') || 'You haven\'t created any challenges yet')}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            {tab === 'all'
              ? (t('createFirstChallengeMessage') || 'Create the first challenge for your group members to complete and earn rewards!')
              : (t('createYourFirstChallengeMessage') || 'Create your first challenge and invite group members to participate!')}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filtersPanel: {
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  newChallengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
