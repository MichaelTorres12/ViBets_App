// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeProvider } from '@/components/ThemeContext';
import { LanguageProvider } from '@/components/LanguageContext';
import { useTheme } from '@/components/ThemeContext';
import { useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '@/store/auth-context'; // <-- importamos el AuthProvider y el hook
import { useGroupsStore } from '@/store/groups-store';         // si necesitas cargar grupos

// Este será tu componente que define la lógica principal
function AppContent() {
  const { colors, theme } = useTheme();
  const router = useRouter();

  // Estado local para manejar si el onboarding fue completado
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkOnboarding() {
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      setOnboardingComplete(seen === 'true');
    }
    checkOnboarding();
  }, []);

  // Traemos user e isLoading del AuthContext
  const { user, isLoading } = useAuth();

  // useEffect para redirigir si no hay user:
  useEffect(() => {
    if (!isLoading && !user) {
      // Si NO hay usuario, se va a la pantalla de login
      router.replace('/auth/login');
    }
  }, [user, isLoading]);

  // Si quieres cargar grupos cuando tengas un usuario:
  const { fetchGroups } = useGroupsStore();
  
  
  useEffect(() => {
    const init = async () => {
      // Revisa si ya vio onboarding
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      const complete = seen === 'true';
      setOnboardingComplete(complete);
      // Si no lo vio, redirige
      if (!complete) {
        router.replace('/onboarding/step1');
      }
    };
    init();
  }, [router]);

  // Cada vez que cambie user, si hay user => fetchGroups
  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user, fetchGroups]);

  // Si estamos cargando (isLoading) o no sabemos si onboarding se completó => muestra loader o null
  if (onboardingComplete === null || isLoading) {
    return null; 
  }

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <SafeAreaProvider>
            <AppContent />
          </SafeAreaProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
