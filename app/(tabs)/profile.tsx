// app/(tabs)/profile.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/store/auth-context';
import { useBetsStore } from '@/store/bets-store';
import { useGroupsStore } from '@/store/groups-store';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useLanguage } from '@/components/LanguageContext';
import { useTheme } from '@/components/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  LogOut, 
  Settings, 
  HelpCircle, 
  Bell, 
  Shield, 
  Users, 
  Trophy,
  ChevronRight,
  CreditCard,
  Heart,
  Plus,
  Play,
  Ban,
  Clock
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { bets } = useBetsStore();
  const { groups, getUserGroups } = useGroupsStore();
  const { colors } = useTheme();
  
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Calcular estadísticas reales del usuario
  const userBets = bets.filter(bet => 
    bet.participations?.some(p => (p.userId === user.id || p.user_id === user.id))
  );
  
  const betsWon = userBets.filter(bet => {
    if (bet.status !== 'settled' || !bet.settled_option) return false;
    
    // Encuentra la participación del usuario
    const userPart = bet.participations?.find(p => 
      p.userId === user.id || p.user_id === user.id
    );
    
    // Si la opción elegida por el usuario es la opción ganadora
    return userPart && (userPart.optionId === bet.settled_option || userPart.option_id === bet.settled_option);
  }).length;
  
  const betsLost = userBets.filter(bet => {
    if (bet.status !== 'settled' || !bet.settled_option) return false;
    
    // Encuentra la participación del usuario
    const userPart = bet.participations?.find(p => 
      p.userId === user.id || p.user_id === user.id
    );
    
    // Si la opción elegida por el usuario NO es la opción ganadora
    return userPart && (userPart.optionId !== bet.settled_option && userPart.option_id !== bet.settled_option);
  }).length;
  
  const userGroups = getUserGroups(user.id).length;
  
  // Logout
  const handleLogout = () => {
    Alert.alert(
      t('logoutConfirmation'),
      t('logoutConfirmationMessage'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('yes'),
          onPress: async () => {
            await signOut();
            // NO navegamos aquí. El Root Layout o un useEffect se encargará
          },
        },
      ]
    );
  };
  
  const navigateToSettings = () => {
    router.push('/settings');
  };
  
  const showTutorial = async () => {
    try {
      // Reiniciar la flag del onboarding
      await AsyncStorage.removeItem('hasSeenOnboarding');
      
      // Navegar a la primera pantalla del onboarding con replace
      // El replace asegura que no se pueda regresar a la pantalla anterior
      router.replace('/onboarding/step1');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      Alert.alert('Error', 'No se pudo reiniciar el tutorial');
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('profile')}</Text>
        <TouchableOpacity 
          style={[styles.settingsButton, { 
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2 
          }]}
          onPress={navigateToSettings}
        >
          <Settings size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Sección del Avatar y datos */}
        <View style={styles.profileSection}>
          <View style={[styles.avatarContainer, { 
            backgroundColor: `${colors.primary}10`,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3
          }]}>
            <Avatar
              uri={undefined}
              name={user.user_metadata?.username ?? user.email}
              size={80}
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.username, { color: colors.text }]}>
              {user.user_metadata?.username ?? 'Sin Username'}
            </Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>
          </View>
        </View>

        {/* Tarjeta con stats (ganadas, perdidas, etc.) */}
        <Card style={[styles.statsCard, { 
          backgroundColor: colors.card,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3 
        }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('statistics') || 'Estadísticas'}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: `${colors.success}15` }]}>
                <Trophy size={20} color={colors.success} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{betsWon}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('betsWon')}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: `${colors.error}15` }]}>
                <Ban size={20} color={colors.error} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{betsLost}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('betsLost')}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <Users size={20} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{userGroups}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('groups')}</Text>
            </View>
          </View>
        </Card>
        
        {/* Sección de items de menú */}
        <View style={styles.menuSection}>
          <Text style={[styles.menuTitle, { color: colors.text }]}>{t('account') || 'Cuenta'}</Text>
          <Card style={[styles.menuCard, { 
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3 
          }]}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={showTutorial}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${colors.primary}15` }]}>
                  <Play size={20} color={colors.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>{t('viewTutorial') || 'Ver Tutorial'}</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            
            {/* Item informativo - Mis grupos - Ahora clickeable */}
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/groups')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${colors.success}15` }]}>
                  <Users size={20} color={colors.success} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>{t('myGroups') || 'Mis Grupos'}</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={[styles.menuItemValue, { color: colors.primary }]}>{userGroups}</Text>
                <ChevronRight size={20} color={colors.textSecondary} style={{marginLeft: 8}} />
              </View>
            </TouchableOpacity>
            
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            
            {/* Item informativo - Mis apuestas - Ahora clickeable */}
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/bets')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${colors.secondary}15` }]}>
                  <Trophy size={20} color={colors.secondary} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>{t('myBets') || 'Mis Predicciones'}</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={[styles.menuItemValue, { color: colors.primary }]}>{userBets.length}</Text>
                <ChevronRight size={20} color={colors.textSecondary} style={{marginLeft: 8}} />
              </View>
            </TouchableOpacity>
          </Card>
          
          <Text style={[styles.menuTitle, { color: colors.text }]}>{t('support') || 'Soporte'}</Text>
          <Card style={[styles.menuCard, { 
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3 
          }]}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${colors.error}15` }]}>
                  <HelpCircle size={20} color={colors.error} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>{t('help') || 'Ayuda'}</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `#9C27B020` }]}>
                  <Heart size={20} color="#9C27B0" />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>{t('about') || 'Acerca de'}</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </Card>
          
          <Text style={[styles.menuTitle, { color: colors.text }]}>{t('importantInfo') || 'Información Importante'}</Text>
          <Card style={[styles.menuCard, { 
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3 
          }]}>
            <View style={styles.infoItem}>
              <View style={[styles.menuIcon, { backgroundColor: `${colors.warning}15` }]}>
                <Clock size={20} color={colors.warning} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                  {t('challengeSettlement') || 'Liquidación de Retos'}
                </Text>
                <Text style={[styles.infoDescription, { color: colors.textSecondary }]}>
                  {t('challengeSettlementInfo') || 'La adjudicación automática de retos y reparto de ganancias se realiza cada 30 minutos. Por favor tenga paciencia.'}
                </Text>
              </View>
            </View>
            
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            
            <View style={styles.infoItem}>
              <View style={[styles.menuIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Clock size={20} color={colors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                  {t('betSettlement') || 'Liquidación de Predicciones'}
                </Text>
                <Text style={[styles.infoDescription, { color: colors.textSecondary }]}>
                  {t('betSettlementInfo') || 'La adjudicación automática de apuestas y reparto de ganancias se realiza cada 20 minutos. Por favor tenga paciencia.'}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarContainer: {
    padding: 4,
    borderRadius: 44,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 12,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  menuSection: {
    paddingHorizontal: 16,
    marginBottom: 100, // Extra padding for tab bar
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  menuCard: {
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
    borderRadius: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
  },
  menuItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
