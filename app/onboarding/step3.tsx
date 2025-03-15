// app/onboarding/step3.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';
// Si quieres usar un gradiente de fondo, descomenta lo siguiente:
// import { LinearGradient } from 'expo-linear-gradient';

export default function OnboardingStep3() {
  const router = useRouter();

  const handleFinishOnboarding = async () => {
    // Guardar que el usuario ya completó el onboarding
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    // Luego redirigir a la pantalla de login (o donde prefieras)
    router.replace('/auth/login');
  };

  return (
    // Si quieres un gradiente, envuelve todo con LinearGradient en lugar de View
    // <LinearGradient
    //   colors={['#FFF', '#F5F5F5']} // Ajusta tus colores de gradiente
    //   style={styles.container}
    // >
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Imagen o ilustración en la parte superior */}
      <Image 
        source={require('../../assets/images/onboarding3.gif')}
        style={{ width: '100%', height: 450 }}
      />

      {/* Título */}
      <Text style={styles.title}>Effortless Crypto Swaps</Text>

      {/* Subtítulo */}
      <Text style={styles.subtitle}>
        Exchange cryptocurrencies quickly, easily, and securely with confidence every single time.
      </Text>

      {/* Dots de paginación */}
      <View style={styles.dotsContainer}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
      </View>

      {/* Botón de acción */}
      <TouchableOpacity style={styles.button} onPress={handleFinishOnboarding}>
        <Text style={styles.buttonText}>Siguiente</Text>
      </TouchableOpacity>

    </View>
    // </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // O quita el color si usarás LinearGradient
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  illustration: {
    width: '100%',      // Ajusta según tus necesidades
    height: 450,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#aaa',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
  },
});
