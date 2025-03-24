// app/auth/register.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useLanguage } from '@/components/LanguageContext';
import { Mail, Lock, User, ArrowRight } from 'lucide-react-native';

import { useAuth } from '@/store/auth-context';  // <-- Usa AuthContext
import { supabase } from '@/services/supabaseClient';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  // Reemplazamos { signUp, loading } de la store por { signUp, isLoading } del AuthContext
  const { signUp, isLoading } = useAuth();

  // Estados para registro
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    // Validaciones REGEX
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/; // Al menos 3 caracteres, solo letras, números y guiones bajos.
    const emailRegex = /^\S+@\S+\.\S+$/;
    const passwordRegex = /^.{6,}$/; // Al menos 6 caracteres

    if (!username || !email || !password || !confirmPassword) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }
    if (!usernameRegex.test(username)) {
      Alert.alert(t('error'), 'El username debe tener al menos 3 caracteres y solo puede contener letras, números y guiones bajos.');
      return;
    }
    if (!emailRegex.test(email)) {
      Alert.alert(t('error'), 'El correo electrónico no es válido.');
      return;
    }
    if (!passwordRegex.test(password)) {
      Alert.alert(t('error'), 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('error'), 'Las contraseñas no coinciden.');
      return;
    }

    // Verificar que el username sea único
    const { data: existingProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username);

    if (profileError) {
      console.error('Error al verificar username:', profileError);
      Alert.alert(t('error'), 'Error al verificar el username. Intenta de nuevo.');
      return;
    }
    if (existingProfiles && existingProfiles.length > 0) {
      Alert.alert(t('error'), 'El username ya está en uso.');
      return;
    }

    try {
      // Registra en Supabase Auth usando *AuthContext* signUp
      await signUp(email, password, username);

      // Obtener usuario actual
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw userError || new Error('Error al obtener el usuario');
      }
      const userId = userData.user.id;
      
      // Inserta en la tabla "profiles"
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: userId, username }]);
      if (insertError) {
        console.error('Error al insertar en profiles:', insertError);
        Alert.alert(t('error'), 'Error al crear el perfil.');
        return;
      }
      
      // Redirige a la app principal
      router.replace('/(tabs)');

    } catch (error: any) {
      console.error("Error al registrarse:", error);
      Alert.alert(t('error'), error.message || t('registrationFailed'));
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
            label="Username"
            placeholder="Tu nombre de usuario"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            leftIcon={<User size={20} color={colors.textSecondary} />}
          />

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

          <Input
            label="Confirmar contraseña"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
            leftIcon={<Lock size={20} color={colors.textSecondary} />}
          />
          
          <Button
            title={t('register')}
            onPress={handleRegister}
            isLoading={isLoading}  // <-- Reemplaza loading por isLoading
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
