// app/auth/login.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useLanguage } from '@/components/LanguageContext';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';

import { useAuth } from '@/store/auth-context';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  // El AuthContext con signIn()
  const { signIn, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }
    const { data, error } = await signIn(email, password);
    if (error) {
      Alert.alert(t('error'), error.message || t('loginFailed'));
    } else {
      // Login ok => a la pantalla principal
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: t('login'),
          headerBackTitle: t('back'),
        }}
      />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/ghostIcon.png')}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>Vi</Text>
          <Text style={styles.logoText}>Bets</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{t('welcome')}</Text>
          <Text style={styles.subtitle}>{t('signIn')}</Text>
        </View>
        
        <View style={styles.form}>
          <Input
            label={t('email')}
            placeholder="user@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={colors.textSecondary} />}
          />
          
          <Input
            label={t('password')}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon={<Lock size={20} color={colors.textSecondary} />}
          />
          
          <Button
            title={t('login')}
            onPress={handleLogin}
            isLoading={isLoading}
            style={styles.loginButton}
            rightIcon={<ArrowRight size={20} color="#000000" />}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('dontHaveAccount')}</Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.signupText}>{t('signUp')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', 
    marginBottom: 50,
    gap: 2,
  },
  logoImage: {
    width: 80,
    height: 70,
    marginRight: 2,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  form: {
    gap: 16,
  },
  loginButton: {
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 48,
  },
  footerText: {
    color: colors.textSecondary,
    marginRight: 4,
  },
  signupText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
