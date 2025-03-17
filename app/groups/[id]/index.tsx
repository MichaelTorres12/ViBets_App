import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Plus } from 'lucide-react-native';

import { useAuthStore } from '@/store/auth-store';
import { useGroupsStore } from '@/store/groups-store';
import { useBetsStore } from '@/store/bets-store';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';

import { GroupInfo } from '@/components/GroupInfo';
import { GroupCoins } from '@/components/GroupCoins';
import { GroupMembers } from '@/components/GroupMembers';
import { BetCard } from '@/components/BetCard';

export default function GroupScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const { colors } = useTheme();
  
  const { getGroupById, fetchGroups } = useGroupsStore();
  const { getGroupBets } = useBetsStore();

  // Estado local para manejar las pestañas: 'bets' o 'members'
  const [activeTab, setActiveTab] = useState<'bets' | 'members'>('bets');

  // Refrescamos datos cada vez que la pantalla se enfoque
  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [])
  );

  const group = getGroupById(id);
  const userGroupCoins = group?.members.find(m => m.userId === user?.id)?.groupCoins ?? 0;

  if (!group) return null;

  const handleCreateBet = () => {
    router.push(`/groups/${id}/create-bet`);
  };

  const handleShareInvite = () => {
    // Funcionalidad para compartir la invitación
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: group.name,

        }} 
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Parte superior: Información del grupo */}
        <View style={styles.topSection}>
          <GroupInfo group={group} onShareInvite={handleShareInvite} />
          
          {/* Monedas del usuario en este grupo */}
          <View style={styles.coinsContainer}>
            <GroupCoins amount={userGroupCoins} />
          </View>

          {/* Pestañas de Bets | Members */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'bets' && styles.activeTabButton]}
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
              style={[styles.tabButton, activeTab === 'members' && styles.activeTabButton]}
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
        </View>

        {/* Contenido que depende de la pestaña activa */}
        <View style={styles.contentSection}>
          {activeTab === 'bets' ? (
            <View>
              {/* Botón Crear Apuesta estilo inline (opcional) */}
              <TouchableOpacity style={styles.newBetButton} onPress={handleCreateBet}>
                <Plus size={16} color="#000" />
                <Text style={styles.newBetButtonText}>{t('newBet') || 'New Bet'}</Text>
              </TouchableOpacity>

              {/* Lista de apuestas */}
              {group.bets && group.bets.length > 0 ? (
                group.bets.map((bet: any) => (
                  <BetCard 
                    key={bet.id} 
                    bet={bet} 
                    userParticipation={bet.userParticipation ?? null} 
                    onPress={() => router.push(`/groups/${id}/bet/${bet.id}`)}
                  />
                ))
              ) : (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('noBets') || 'No bets in this group'}
                </Text>
              )}
            </View>
          ) : (
            // Pestana de miembros
            <View>
              <GroupMembers members={group.members} />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/* ======================= ESTILOS ======================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  createButton: {
    marginRight: 16,
  },

  /* Top Section (Info del grupo, monedas, tabs) */
  topSection: {
    padding: 16,
    paddingBottom: 0,
  },
  coinsContainer: {
    marginTop: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 16,
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

  /* Contenido de cada pestaña */
  contentSection: {
    padding: 16,
    paddingTop: 8,
  },

  /* Apuestas */
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
  emptyText: {
    marginTop: 8,
    textAlign: 'center',
  },
});

