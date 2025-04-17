// app/auth/register.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useLanguage } from '@/components/LanguageContext';
import { Mail, Lock, User, ArrowRight, Check, X } from 'lucide-react-native';

import { useAuth } from '@/store/auth-context';
import { supabase } from '@/services/supabaseClient';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { signUp, isLoading } = useAuth();

  // Estados para registro
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para validación en tiempo real
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  
  // Expresiones regulares para validación
  const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^.{6,}$/;

  // Validar username en tiempo real
  useEffect(() => {
    if (username === '') {
      setUsernameValid(null);
      return;
    }
    setUsernameValid(usernameRegex.test(username));
  }, [username]);

  // Validar email en tiempo real
  useEffect(() => {
    if (email === '') {
      setEmailValid(null);
      return;
    }
    setEmailValid(emailRegex.test(email));
  }, [email]);

  // Validar password en tiempo real
  useEffect(() => {
    if (password === '') {
      setPasswordValid(null);
      return;
    }
    setPasswordValid(passwordRegex.test(password));
    
    // También validamos si las contraseñas coinciden
    if (confirmPassword === '') {
      setPasswordsMatch(null);
    } else {
      setPasswordsMatch(password === confirmPassword);
    }
  }, [password]);

  // Validar confirmación de password en tiempo real
  useEffect(() => {
    if (confirmPassword === '') {
      setPasswordsMatch(null);
      return;
    }
    setPasswordsMatch(password === confirmPassword);
  }, [confirmPassword, password]);

  const handleRegister = async () => {
    // Validación completa antes de enviar
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    if (!usernameValid || !emailValid || !passwordValid || !passwordsMatch) {
      Alert.alert(t('error'), t('fixFormErrors') || 'Por favor corrige los errores en el formulario');
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
          <View>
            <Input
              label="Username"
              placeholder="Tu nombre de usuario"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              leftIcon={<User size={20} color={colors.textSecondary} />}
              rightIcon={
                usernameValid === true ? <Check size={20} color={colors.success} /> : 
                usernameValid === false ? <X size={20} color={colors.error} /> : null
              }
            />
            {usernameValid === false && (
              <Text style={styles.validationText}>
                Al menos 3 caracteres, solo letras, números y _
              </Text>
            )}
          </View>

          <View>
            <Input
              label={t('email')}
              placeholder="user@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} color={colors.textSecondary} />}
              rightIcon={
                emailValid === true ? <Check size={20} color={colors.success} /> : 
                emailValid === false ? <X size={20} color={colors.error} /> : null
              }
            />
            {emailValid === false && (
              <Text style={styles.validationText}>
                Introduce un correo electrónico válido
              </Text>
            )}
          </View>
          
          <View>
            <Input
              label={t('password')}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon={<Lock size={20} color={colors.textSecondary} />}
              rightIcon={
                passwordValid === true ? <Check size={20} color={colors.success} /> : 
                passwordValid === false ? <X size={20} color={colors.error} /> : null
              }
            />
            {passwordValid === false && (
              <Text style={styles.validationText}>
                La contraseña debe tener al menos 6 caracteres
              </Text>
            )}
          </View>

          <View>
            <Input
              label="Confirmar contraseña"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              leftIcon={<Lock size={20} color={colors.textSecondary} />}
              rightIcon={
                passwordsMatch === true ? <Check size={20} color={colors.success} /> : 
                passwordsMatch === false ? <X size={20} color={colors.error} /> : null
              }
            />
            {passwordsMatch === false && (
              <Text style={styles.validationText}>
                Las contraseñas no coinciden
              </Text>
            )}
          </View>
          
          <Button
            title={t('register')}
            onPress={handleRegister}
            isLoading={isLoading}
            style={styles.registerButton}
            rightIcon={<ArrowRight size={20} color="#000000" />}
            disabled={!usernameValid || !emailValid || !passwordValid || !passwordsMatch}
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

// Estilos (añadimos más estilos)
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
  validationText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  }
});
