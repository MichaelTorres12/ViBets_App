// app/settings.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, Image, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/store/auth-context';
import { useLanguage } from '@/components/LanguageContext';
import { useTheme } from '@/components/ThemeContext';
import { useLanguageStore } from '@/store/language-store';
import { useThemeStore } from '@/store/theme-store';
import { Card } from '@/components/Card';
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
  ChevronRight,
  ArrowLeft
} from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const { colors, theme } = useTheme();
  const { language, setLanguage } = useLanguageStore();
  const { theme: currentTheme, setTheme } = useThemeStore();
  const isLight = theme === 'light';
  
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
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  const handleBack = () => {
    router.back();
  };

  const handleContactUs = () => {
    const email = 'vibetsapp@gmail.com';
    const subject = encodeURIComponent(t('contactSubject') || 'Consulta desde ViBets App');
    const body = encodeURIComponent(t('contactBody') || 'Hola, me gustaría hablar sobre...');
    
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
    
    Linking.canOpenURL(mailtoUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(mailtoUrl);
        } else {
          Alert.alert(
            t('error') || 'Error',
            t('noEmailClient') || 'No se encontró una aplicación de correo electrónico'
          );
        }
      })
      .catch(error => {
        console.error('Error al abrir el cliente de correo:', error);
        Alert.alert(
          t('error') || 'Error',
          t('emailError') || 'No se pudo abrir la aplicación de correo'
        );
      });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: t('settings'),
          headerBackTitle: t('back'),
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/vibets-icon.png')}
          style={styles.logoImage}
        />
        <Text style={[styles.logoText, { color: colors.text }]}>Vi</Text>
        <Text style={[styles.logoTextSecondary, { color: colors.primary }]}>Bets</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card 
          style={styles.section} 
          variant={isLight ? "elevated" : "default"}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('appSettings')}</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { 
              borderBottomColor: colors.border,
              backgroundColor: isLight ? colors.card : colors.cardLight,
            }]} 
            onPress={handleLanguageChange}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Globe size={22} color={isLight ? colors.primary : colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t('language')}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {language === 'en' ? t('english') : t('spanish')}
              </Text>
              <ChevronRight size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
          
          <View style={[styles.settingItem, {
            borderBottomColor: colors.border,
            backgroundColor: isLight ? colors.card : colors.cardLight,
          }]}>
            <View style={styles.settingLeft}>
              {currentTheme === 'dark' ? (
                <Moon size={22} color={isLight ? colors.primary : colors.text} />
              ) : (
                <Sun size={22} color={isLight ? colors.primary : colors.text} />
              )}
              <Text style={[styles.settingText, { color: colors.text }]}>
                {currentTheme === 'dark' ? t('darkTheme') : t('lightTheme')}
              </Text>
            </View>
            <Switch 
              value={currentTheme === 'dark'} 
              onValueChange={toggleTheme} 
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isLight ? '#FFFFFF' : colors.background}
              ios_backgroundColor={isLight ? "#E9E9EA" : colors.cardLight}
            />
          </View>
        </Card>
        
        <Card 
          style={styles.section} 
          variant={isLight ? "elevated" : "default"}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('notifications')}</Text>
          
          <View style={[styles.settingItem, { 
            borderBottomColor: colors.border,
            backgroundColor: isLight ? colors.card : colors.cardLight,
          }]}>
            <View style={styles.settingLeft}>
              <Bell size={22} color={isLight ? colors.primary : colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t('notificationSettings')}</Text>
            </View>
            <Switch 
              value={true} 
              onValueChange={() => {}} 
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isLight ? '#FFFFFF' : colors.background}
              ios_backgroundColor={isLight ? "#E9E9EA" : colors.cardLight}
            />
          </View>
          
          <View style={[styles.settingItem, { 
            borderBottomColor: colors.border,
            backgroundColor: isLight ? colors.card : colors.cardLight,
          }]}>
            <View style={styles.settingLeft}>
              <Volume2 size={22} color={isLight ? colors.primary : colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t('soundEffects')}</Text>
            </View>
            <Switch 
              value={true} 
              onValueChange={() => {}} 
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isLight ? '#FFFFFF' : colors.background}
              ios_backgroundColor={isLight ? "#E9E9EA" : colors.cardLight}
            />
          </View>
          
          <View style={[styles.settingItem, { 
            borderBottomWidth: 0,
            backgroundColor: isLight ? colors.card : colors.cardLight,
          }]}>
            <View style={styles.settingLeft}>
              <Vibrate size={22} color={isLight ? colors.primary : colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t('vibration')}</Text>
            </View>
            <Switch 
              value={true} 
              onValueChange={() => {}} 
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isLight ? '#FFFFFF' : colors.background}
              ios_backgroundColor={isLight ? "#E9E9EA" : colors.cardLight}
            />
          </View>
        </Card>
        
        <Card 
          style={styles.section} 
          variant={isLight ? "elevated" : "default"}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('about')}</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { 
              borderBottomColor: colors.border,
              backgroundColor: isLight ? colors.card : colors.cardLight,
            }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Info size={22} color={isLight ? colors.primary : colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t('version')}</Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>1.0.0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { 
              borderBottomColor: colors.border,
              backgroundColor: isLight ? colors.card : colors.cardLight,
            }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <FileText size={22} color={isLight ? colors.primary : colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t('termsOfService')}</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, {
              borderBottomWidth: 0,
              backgroundColor: isLight ? colors.card : colors.cardLight,
            }]}
            activeOpacity={0.7}
            onPress={handleContactUs}
          >
            <View style={styles.settingLeft}>
              <Mail size={22} color={isLight ? colors.primary : colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t('contactUs')}</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>
        
        <TouchableOpacity
          style={[styles.logoutButton, { 
            backgroundColor: isLight ? `${colors.error}10` : colors.card,
            borderWidth: isLight ? 1 : 0,
            borderColor: isLight ? `${colors.error}30` : 'transparent',
          }]}
          onPress={handleLogout}
          activeOpacity={0.7}
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
  backButton: {
    marginRight: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  logoImage: {
    width: 55,
    height: 53,
    marginRight: 6,
  },
  logoText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  logoTextSecondary: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 16,
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
    borderRadius: 16,
    marginBottom: 32,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});