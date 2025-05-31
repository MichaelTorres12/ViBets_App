import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/components/ThemeContext';

export function LoadingScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Image
          source={require('../assets/images/vibets-icon.png')}
          style={styles.logo}
        />
        <Text style={[styles.title, { color: colors.text }]}>
          Goatify
        </Text>
        <ActivityIndicator 
          size="large" 
          color={colors.primary} 
          style={styles.spinner}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  spinner: {
    marginTop: 16,
  }
}); 