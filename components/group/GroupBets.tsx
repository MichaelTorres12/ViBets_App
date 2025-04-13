// components/GroupBets.tsx
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

  // Estado para orden y filtro
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'settled'>('all');

  // Opciones de filtro con iconos
  const statuses = [
    { label: t('all') || 'Todas', value: 'all', icon: List },
    { label: t('open') || 'Abiertas', value: 'open', icon: CheckCircle },
    { label: t('closed') || 'Cerradas', value: 'closed', icon: XCircle },
    { label: t('settled') || 'Resueltas', value: 'settled', icon: Trophy },
  ];

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
  };

  // Filtrar y ordenar las apuestas según el status y fecha
  const bets = group.bets || [];
  const filteredBets = bets.filter(bet => {
    if (statusFilter === 'all') return true;
    return bet.status === statusFilter;
  });
  const sortedBets = [...filteredBets].sort((a, b) => {
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

  // Componente header para la FlatList (incluye los filtros)
  const listHeader = () => (
    <>
      {/* Contenedor de filtros: Orden y Estado */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            { 
              borderColor: colors.border,
              backgroundColor: colors.cardLight
            }
          ]} 
          onPress={toggleSortOrder}
        >
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

        {/* Filtros horizontales */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statusFiltersContainer}
        >
          <View style={styles.statusFilters}>
            {statuses.map(status => {
              const IconComponent = status.icon;
              const isActive = statusFilter === status.value;
              return (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.statusButton,
                    { 
                      backgroundColor: isActive ? colors.primary : colors.cardLight,
                      borderColor: isActive ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() =>
                    setStatusFilter(status.value as 'all' | 'open' | 'closed' | 'settled')
                  }
                >
                  <IconComponent
                    size={16}
                    color={isActive ? colors.textInverted : colors.text}
                    style={styles.statusIcon}
                  />
                  <Text
                    style={[
                      styles.statusButtonText,
                      { 
                        color: isActive ? colors.textInverted : colors.text,
                        fontWeight: isActive ? 'bold' : 'normal'
                      }
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
    </>
  );

  // Estado vacío para cuando no hay apuestas
  const EmptyState = () => (
    <View style={[styles.emptyContainer, { marginTop: 40 }]}>
      <View style={[styles.emptyIconContainer, { backgroundColor: `${colors.primary}15` }]}>
        <Trophy size={40} color={colors.primary} />
      </View>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        {t('noBets') || 'No hay apuestas'}
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        {t('createFirstBetMessage') || 'Crea la primera apuesta en este grupo'}
      </Text>
      <TouchableOpacity 
        style={[styles.emptyButton, { backgroundColor: colors.primary }]} 
        onPress={handleCreateBet}
      >
        <Plus size={18} color={colors.textInverted} />
        <Text style={[styles.emptyButtonText, { color: colors.textInverted }]}>
          {t('createBet') || 'Crear Apuesta'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Encabezado fijo: Título y botón de crear apuesta */}
      <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
        <Text style={[styles.fixedTitle, { color: colors.text }]}>
          {t('allBets') || 'All Bets'}
        </Text>
        <TouchableOpacity 
          style={[styles.newBetButton, { backgroundColor: colors.primary }]} 
          onPress={handleCreateBet}
        >
          <Plus size={16} color={colors.textInverted} />
          <Text style={[styles.newBetButtonText, { color: colors.textInverted }]}>
            {t('newBet') || 'New Bet'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* FlatList con ListHeaderComponent para filtros y lista de apuestas */}
      <FlatList
        data={sortedBets}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={EmptyState}
        renderItem={({ item }) => (
          <BetCard
            key={item.id}
            bet={item}
            userParticipation={item.userParticipation || null}
            onPress={() => router.push(`/groups/${group.id}/bet/${item.id}`)}
          />
        )}
        contentContainerStyle={[
          styles.betsList,
          sortedBets.length === 0 && { flex: 1 }
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  fixedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  newBetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  newBetButtonText: {
    marginLeft: 6,
    fontWeight: '600',
  },
  filtersContainer: {
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  sortIcon: {
    marginRight: 6,
  },
  filterButtonText: {
    fontSize: 14,
  },
  statusFiltersContainer: {
    marginBottom: 4,
  },
  statusFilters: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusButtonText: {
    fontSize: 14,
  },
  betsList: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 32,
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyButtonText: {
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
});
