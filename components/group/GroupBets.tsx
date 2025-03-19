// components/group/GroupBets.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Plus, ArrowUp, ArrowDown, List, CheckCircle, XCircle, Trophy } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BetCard } from '@/components/BetCard';
import { Group } from '@/types';

interface GroupBetsProps {
  group: Group;
}

export function GroupBets({ group }: GroupBetsProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  // Extender el estado de filtro para incluir "settled"
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'settled'>('all');

  // Opciones de filtro de estado, ahora con iconos asignados
  const statuses = [
    { label: t('all') || 'Todas', value: 'all', icon: List },
    { label: t('open') || 'Abiertas', value: 'open', icon: CheckCircle },
    { label: t('closed') || 'Cerradas', value: 'closed', icon: XCircle },
    { label: t('settled') || 'Resueltas', value: 'settled', icon: Trophy },
  ];

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  // Filtrar y ordenar las apuestas según el status y la fecha de creación
  const bets = group.bets || [];
  const filteredBets = bets.filter((bet) => {
    if (statusFilter === 'all') return true;
    return bet.status === statusFilter;
  });
  const sortedBets = [...filteredBets].sort((a, b) => {
    // Se asume que cada apuesta tiene "createdAt" o "created_at"
    const dateA = new Date(a.createdAt || a.created_at);
    const dateB = new Date(b.createdAt || b.created_at);
    return sortOrder === 'desc'
      ? dateB.getTime() - dateA.getTime()
      : dateA.getTime() - dateB.getTime();
  });

  useEffect(() => {
    console.log("GroupBets - Bets filtradas y ordenadas:", sortedBets);
  }, [sortedBets]);

  const handleCreateBet = () => {
    router.push(`/groups/${group.id}/create-bet`);
  };

  return (
    <View style={styles.container}>
      {/* Título de sección */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('allBets') || 'All Bets'}
        </Text>

        {/* Botón Crear Apuesta */}
        <TouchableOpacity style={styles.newBetButton} onPress={handleCreateBet}>
          <Plus size={16} color="#000" />
          <Text style={styles.newBetButtonText}>
            {t('newBet') || 'New Bet'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenedor de filtros: Orden y Estado */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.filterButton} onPress={toggleSortOrder}>
          {sortOrder === 'desc' ? (
            <ArrowDown size={16} color={colors.text} style={styles.sortIcon} />
          ) : (
            <ArrowUp size={16} color={colors.text} style={styles.sortIcon} />
          )}
          <Text style={[styles.filterButtonText, { color: colors.text }]}>
            {sortOrder === 'desc'
              ? (t('recentFirst') || 'Recientes primero')
              : (t('oldFirst') || 'Antiguas primero')}
          </Text>
        </TouchableOpacity>

        {/* Envolvemos los botones de filtro en un ScrollView horizontal */}
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <View style={styles.statusFilters}>
            {statuses.map((status) => {
              const IconComponent = status.icon;
              return (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.statusButton,
                    statusFilter === status.value && { backgroundColor: colors.filter },
                  ]}
                  onPress={() =>
                    setStatusFilter(status.value as 'all' | 'open' | 'closed' | 'settled')
                  }
                >
                  <IconComponent
                    size={16}
                    color={statusFilter === status.value ? '#fff' : '#fff'}
                    style={styles.statusIcon}
                  />
                  <Text
                    style={[
                      styles.statusButtonText,
                      statusFilter === status.value && { color: '#fff', fontWeight: 'bold' },
                    ]}
                  >
                    {status.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Lista de apuestas */}
      {sortedBets.length > 0 ? (
        <FlatList
          data={sortedBets}
          renderItem={({ item }) => (
            <BetCard
              key={item.id}
              bet={item}
              userParticipation={item.userParticipation || null}
              onPress={() => router.push(`/groups/${group.id}/bet/${item.id}`)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.betsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('noBets') || 'No bets in this group'}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            {t('createFirstBet') || 'Create your first bet!'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  newBetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD60A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newBetButtonText: {
    marginLeft: 6,
    color: '#000',
    fontWeight: '600',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    borderWidth: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  sortIcon: {
    marginRight: 4,
  },
  filterButtonText: {
    fontSize: 14,
  },
  statusFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  betsList: {
    gap: 2,
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
