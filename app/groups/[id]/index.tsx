import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';

import { useAuth } from '@/store/auth-context';  
import { useGroupsStore } from '@/store/groups-store';
import { useBetsStore } from '@/store/bets-store';
import { useTheme } from '@/components/ThemeContext';

import { GroupInfo } from '@/components/GroupInfo';
import { GroupCoins } from '@/components/GroupCoins';
import { GroupHome } from '@/components/group/GroupHome';
import { GroupBets } from '@/components/group/GroupBets';
import { GroupChallenges } from '@/components/group/GroupChallenges';
import { GroupLeaderboard } from '@/components/group/GroupLeaderboard';
import { GroupChat } from '@/components/group/GroupChat';
import { GroupTabNavigator } from '@/components/group/GroupTabNavigator';

export default function GroupScreen() {
  const router = useRouter();
  const { id, tab: initialTab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const { user } = useAuth();  
  const { colors } = useTheme();
  
  const { getGroupById, fetchGroups } = useGroupsStore();
  
  // Estado para controlar la pestaña activa, con inicialización desde params o default a 'home'
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'home');

  // Actualizar activeTab si cambia initialTab (navegación desde otra pantalla)
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Refrescamos datos cada vez que la pantalla se enfoque
  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [fetchGroups])
  );

  const group = getGroupById(id);
  const userGroupCoins = group?.members.find(m => m.userId === user?.id)?.groupCoins ?? 0;

  if (!group) return null;

  const handleShareInvite = () => {
    // Funcionalidad para compartir la invitación
  };

  // Renderiza el contenido según la pestaña activa
  const renderTabContent = () => {
    switch(activeTab) {
      case 'home':
        return <GroupHome group={group} userGroupCoins={userGroupCoins} />;
      case 'bets':
        return <GroupBets group={group} />;
      case 'challenges':
        return <GroupChallenges group={group} />;
      case 'goats':
        return <GroupLeaderboard group={group} />;
      case 'chat':
        return <GroupChat group={group} />;
      default:
        return <GroupHome group={group} userGroupCoins={userGroupCoins} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: group.name,
        }} 
      />

      <View style={styles.content}>

        
        {/* Contenido principal según la pestaña activa */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      </View>

      {/* Navegador de pestañas en la parte inferior */}
      <GroupTabNavigator 
        activeTab={activeTab} 
        onChangeTab={setActiveTab} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  infoScrollView: {
    maxHeight: 250,
  },
  infoContainer: {
    padding: 16,
    paddingBottom: 8,
    gap: 8,
  },
  tabContent: {
    flex: 1,
  },
});


