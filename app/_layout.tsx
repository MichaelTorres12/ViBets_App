import React, { useEffect, useState } from 'react';
import { Slot, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { LanguageProvider } from '@/components/LanguageContext';
import { ThemeProvider } from '@/components/ThemeContext';
import { useTheme } from '@/components/ThemeContext';

// This component is needed to access the theme context
const AppContent = () => {
  const { colors, theme } = useTheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simulate loading resources
    const prepare = async () => {
      try {
        // Load any resources here
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    };

    prepare();
  }, []);

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {!isReady ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
          <Text style={{ color: colors.text, fontSize: 18 }}>Loading...</Text>
        </View>
      ) : (
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ title: 'Login' }} />
          <Stack.Screen name="auth/register" options={{ title: 'Register' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        </Stack>
      )}
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