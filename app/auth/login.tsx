// app/auth/login.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useLanguage } from '@/components/LanguageContext';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const { signIn, isAuthenticated, loading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }
    try {
      await signIn(email, password); // si no hay throw, ya se logueó
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('loginFailed'));
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
            secureTextEntry
            leftIcon={<Lock size={20} color={colors.textSecondary} />}
          />
          
          <Button
            title={t('login')}
            onPress={handleLogin}
            isLoading={loading}
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

// Estilos
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
