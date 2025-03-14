//app/auth/register.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useLanguage } from '@/components/LanguageContext';
import { Mail, Lock, User, ArrowRight } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const { t } = useLanguage();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }
    
    try {
      await register(username, email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(t('error'), t('registrationFailed'));
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: t('register'),
          headerBackTitle: t('back'),
        }}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('createAccount')}</Text>
          <Text style={styles.subtitle}>{t('signUp')}</Text>
        </View>
        
        <View style={styles.form}>
          <Input
            label={t('username')}
            placeholder="johndoe"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            leftIcon={<User size={20} color={colors.textSecondary} />}
          />
          
          <Input
            label={t('email')}
            placeholder="example@email.com"
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
            title={t('register')}
            onPress={handleRegister}
            isLoading={isLoading}
            style={styles.registerButton}
            rightIcon={<ArrowRight size={20} color="#000000" />}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('alreadyHaveAccount')}</Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginText}>{t('signIn')}</Text>
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
  registerButton: {
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
  loginText: {
    color: colors.primary,
    fontWeight: '600',
  },
});