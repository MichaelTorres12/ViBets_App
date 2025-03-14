//app/(tabs)/profile.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CoinDisplay } from '@/components/CoinDisplay';
import { useLanguage } from '@/components/LanguageContext';
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
  Gift,
  Heart,
  Plus
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { t } = useLanguage();
  
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
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
          text: t('logout'),
          onPress: () => {
            logout();
            router.replace('/auth/login');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const navigateToSettings = () => {
    router.push('/settings');
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('profile')}</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={navigateToSettings}
        >
          <Settings size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Avatar
            uri={user.avatar}
            name={user.username}
            size={80}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>
        
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={['#1A1A1A', '#2A2A2A']}
            style={styles.balanceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.balanceContent}>
              <View>
                <Text style={styles.balanceLabel}>{t('yourBalance')}</Text>
                <Text style={styles.balanceValue}>${user.coins.toLocaleString()}</Text>
              </View>
              <Button
                title={t('addFunds')}
                size="small"
                rounded
                leftIcon={<Plus size={16} color="#000000" />}
                style={{ paddingHorizontal: 12 }}
                onPress={() => {
                  // Implementa la lógica para añadir fondos o deja un placeholder
                  console.log('Add funds pressed');
                }}
              />
            </View>
          </LinearGradient>
        </View>
        
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>{t('betsWon')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>{t('betsLost')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>{t('groups')}</Text>
            </View>
          </View>
        </Card>
        
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>{t('account')}</Text>
          
          <Card style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#4361EE20' }]}>
                  <Users size={20} color="#4361EE" />
                </View>
                <Text style={styles.menuItemText}>{t('friends')}</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#00E67620' }]}>
                  <Trophy size={20} color="#00E676" />
                </View>
                <Text style={styles.menuItemText}>{t('achievements')}</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#FFAA0020' }]}>
                  <Bell size={20} color="#FFAA00" />
                </View>
                <Text style={styles.menuItemText}>{t('notifications')}</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#FF3D7120' }]}>
                  <CreditCard size={20} color="#FF3D71" />
                </View>
                <Text style={styles.menuItemText}>{t('paymentMethods')}</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </Card>
          
          <Text style={styles.menuTitle}>{t('support')}</Text>
          
          <Card style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#4CC9F020' }]}>
                  <HelpCircle size={20} color="#4CC9F0" />
                </View>
                <Text style={styles.menuItemText}>{t('helpFaq')}</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#7209B720' }]}>
                  <Shield size={20} color="#7209B7" />
                </View>
                <Text style={styles.menuItemText}>{t('privacyPolicy')}</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#F7258520' }]}>
                  <Heart size={20} color="#F72585" />
                </View>
                <Text style={styles.menuItemText}>{t('inviteFriends')}</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </Card>
          
          <Button
            title={t('logout')}
            variant="outline"
            style={styles.logoutButton}
            leftIcon={<LogOut size={20} color={colors.error} />}
            textStyle={{ color: colors.error }}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
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
    color: colors.text,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 12,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  balanceGradient: {
    padding: 16,
  },
  balanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  addCoinsButton: {
    paddingHorizontal: 12,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 24,
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
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  menuSection: {
    paddingHorizontal: 16,
    marginBottom: 100, // Extra padding for tab bar
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  menuCard: {
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
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
    color: colors.text,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  logoutButton: {
    marginTop: 8,
    borderColor: colors.error,
  },
});