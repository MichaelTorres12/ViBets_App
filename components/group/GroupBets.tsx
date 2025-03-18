import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Plus } from 'lucide-react-native';
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
        <TouchableOpacity 
          style={styles.newBetButton} 
          onPress={handleCreateBet}
        >
          <Plus size={16} color="#000" />
          <Text style={styles.newBetButtonText}>
            {t('newBet') || 'New Bet'}
          </Text>
        </TouchableOpacity>
      </View>

    {/* Lista de apuestas */}
    {group.bets && group.bets.length > 0 ? (
    <FlatList
        data={group.bets}
        renderItem={({ item }) => (
        <BetCard 
            key={item.id} 
            bet={item} 
            userParticipation={item.userParticipation || null} 
            onPress={() => router.push(`/groups/${group.id}/bet/${item.id}`)}
        />
        )}
        keyExtractor={item => item.id}
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
    padding: 16,
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
  }
}); 