// app/settings.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/store/auth-context';
import { useLanguage } from '@/components/LanguageContext';
import { colors } from '@/constants/colors';
import { useTheme } from '@/components/ThemeContext';
import { useLanguageStore } from '@/store/language-store';
import { useThemeStore } from '@/store/theme-store';
import {
  LogOut,
  Moon,
  Sun,
  Bell,
  Volume2,
  Vibrate,
  Info,
  FileText,
  Mail,
  Globe,
  ChevronRight
} from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth(); // <-- del AuthContext
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { language, setLanguage } = useLanguageStore();
  const { theme, setTheme } = useThemeStore();
  
  // Al hacer logout, llamamos signOut()
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
  
  
  

  const handleLanguageChange = () => {
    Alert.alert(
      t('changeLanguage'),
      '',
      [
        { text: t('english'), onPress: () => setLanguage('en') },
        { text: t('spanish'), onPress: () => setLanguage('es') },
        { text: t('cancel'), style: 'cancel' },
      ]
    );
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: t('settings'),
          headerBackTitle: t('back'),
        }}
      />

      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/ghostIcon.png')}
          style={styles.logoImage}
        />
        <Text style={styles.logoText}>Vi</Text>
        <Text style={styles.logoText}>Bets</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('appSettings')}</Text>
          
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={handleLanguageChange}>
            <View style={styles.settingLeft}>
              <Globe size={22} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t('language')}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {language === 'en' ? t('english') : t('spanish')}
              </Text>
              <ChevronRight size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              {theme === 'dark' ? (
                <Moon size={22} color={colors.text} />
              ) : (
                <Sun size={22} color={colors.text} />
              )}
              <Text style={[styles.settingText, { color: colors.text }]}>
                {theme === 'dark' ? t('darkTheme') : t('lightTheme')}
              </Text>
            </View>
            <Switch 
              value={theme === 'dark'} 
              onValueChange={toggleTheme} 
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('notifications')}</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Bell size={22} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t('notificationSettings')}</Text>
            </View>
            <Switch 
              value={true} 
              onValueChange={() => {}} 
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Volume2 size={22} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t('soundEffects')}</Text>
            </View>
            <Switch 
              value={true} 
              onValueChange={() => {}} 
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Vibrate size={22} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t('vibration')}</Text>
            </View>
            <Switch 
              value={true} 
              onValueChange={() => {}} 
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('about')}</Text>
          
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Info size={22} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t('version')}</Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>1.0.0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <FileText size={22} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t('termsOfService')}</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Mail size={22} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t('contactUs')}</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        {/* Botón de logout */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.card }]}
          onPress={handleLogout}
        >
          <LogOut size={22} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginBottom: 10,
  },
  logoImage: {
    width: 55,
    height: 50,
    marginRight: 6,
  },
  logoText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.text,
  },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 14,
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});