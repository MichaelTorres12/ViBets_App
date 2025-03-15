// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Slot, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@/components/ThemeContext';
import { LanguageProvider } from '@/components/LanguageContext';
import { useTheme } from '@/components/ThemeContext';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';

const AppContent = () => {
  const { colors, theme } = useTheme();
  const router = useRouter();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const { checkSession, subscribeAuth } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await checkSession();
      subscribeAuth();
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      const complete = seen === 'true';
      setOnboardingComplete(complete);
      if (!complete) {
        router.replace('/onboarding/step1');
      }
    };
    init();
  }, [router, checkSession, subscribeAuth]);

  // Mientras se verifica el onboarding, no renderizamos nada
  if (onboardingComplete === null) {
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
        {/* Solo incluimos las rutas que realmente pertenecen a la navegación principal */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />

        {/* Resto de pantallas */}
        <Slot />
      </Stack>
    </>
  );
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
