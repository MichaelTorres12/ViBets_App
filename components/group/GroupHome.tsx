// components/GroupHome.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BetCard } from '@/components/BetCard';
import { GroupInfo } from '@/components/GroupInfo';
import { GroupCoins } from '@/components/GroupCoins';
import { GroupMembers } from '@/components/GroupMembers';
import { Group, Bet, BetParticipation } from '@/types';
import { useAuth } from '@/store/auth-context';

interface GroupHomeProps {
  group: Group;
  userGroupCoins: number;
}

export function GroupHome({ group, userGroupCoins }: GroupHomeProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'bets' | 'members'>('bets');

  const handleCreateBet = () => {
    router.push(`/groups/${group.id}/create-bet`);
  };

  const handleShareInvite = () => {
    // Funcionalidad para compartir la invitación
  };

  // Ordenar las apuestas de forma descendente (más recientes primero) y obtener sólo las 3 primeras
  const recentBets =
    group.bets && group.bets.length > 0
      ? [...group.bets]
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at).getTime();
            const dateB = new Date(b.createdAt || b.created_at).getTime();
            return dateB - dateA;
          })
          .slice(0, 3)
      : [];

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Información del grupo */}
      <View style={styles.infoSection}>
        <GroupInfo 
          group={group} 
          onShareInvite={handleShareInvite}
        />
        
        <View style={styles.coinsContainer}>
          <GroupCoins amount={userGroupCoins} />
        </View>
      </View>

      {/* Pestañas de Bets | Members */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'bets' && [styles.activeTabButton, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('bets')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'bets' ? colors.primary : colors.textSecondary }
            ]}
          >
            {t('bets') || 'Bets'} 
            <Text style={styles.countBadge}>
              {group.bets ? ` (${group.bets.length})` : ' (0)'}
            </Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'members' && [styles.activeTabButton, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('members')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'members' ? colors.primary : colors.textSecondary }
            ]}
          >
            {t('members') || 'Members'}
            <Text style={styles.countBadge}>
              {group.members ? ` (${group.members.length})` : ' (0)'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido según la pestaña activa */}
      <View style={styles.tabContent}>
        {activeTab === 'bets' ? (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('recentBets') || 'Recent Predictions'}
              </Text>
              
              <TouchableOpacity onPress={() => router.push(`/groups/${group.id}?tab=bets`)}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>
                  {t('seeAll') || 'See All'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Botón Crear Predicción */}
            <TouchableOpacity style={styles.newBetButton} onPress={handleCreateBet}>
              <Plus size={16} color="#000" />
              <Text style={styles.newBetButtonText}>{t('newBet') || 'New Prediction'}</Text>
            </TouchableOpacity>

            {/* Lista de apuestas recientes */}
            {recentBets.length > 0 ? (
              recentBets.map((bet: Bet) => {
                // Buscar la participación del usuario actual en esta apuesta
                const userParticipation = bet.participations?.find(p => 
                  p.userId === user?.id || p.user_id === user?.id
                );
                
                return (
                  <BetCard 
                    key={bet.id} 
                    bet={bet} 
                    userParticipation={userParticipation || null} 
                    onPress={() => router.push(`/groups/${group.id}/bet/${bet.id}`)}
                  />
                );
              })
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
        ) : (
          <GroupMembers members={group.members} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoSection: {
    padding: 10,
  },
  coinsContainer: {
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  countBadge: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  tabContent: {
    padding: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  newBetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#FFD60A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  newBetButtonText: {
    marginLeft: 6,
    color: '#000',
    fontWeight: '600',
  },
  emptyContainer: {
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
