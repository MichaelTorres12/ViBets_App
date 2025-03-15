//app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Slot, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { LanguageProvider } from '@/components/LanguageContext';
import { ThemeProvider } from '@/components/ThemeContext';
import { useTheme } from '@/components/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// This component is needed to access the theme context
const AppContent = () => {
  const { colors, theme } = useTheme();
  const router = useRouter();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      const complete = seen === 'true';
      setOnboardingComplete(complete);
      if (!complete) {
        // Una vez montado, redirige al onboarding
        router.replace('/onboarding/step1');
      }
    };
    checkOnboarding();
  }, []);

  /*
  useEffect(() => {
    // Forzamos siempre la redirección al onboarding para poder depurar sus vistas
    router.replace('/onboarding/step1');

    // Si prefieres dejar la lógica pero forzando el valor a false, podrías hacerlo así:
    // setOnboardingComplete(false);
    // router.replace('/onboarding/step1'); 
  }, []); */

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background, },
            animation: 'slide_from_right',
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: 'bold', },
            contentStyle: { backgroundColor: colors.background, },
          }}
        >
          <Stack.Screen name="step1" options={{ headerShown: false }} />
          <Stack.Screen name="step2" options={{ headerShown: false }} />
          <Stack.Screen name="step3" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />

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