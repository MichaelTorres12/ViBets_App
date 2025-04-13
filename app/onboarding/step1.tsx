//app/onboarding/step1.tsx

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '@/components/LanguageContext';

// Si quieres usar un gradiente de fondo, descomenta lo siguiente:
import { LinearGradient } from 'expo-linear-gradient';

export default function OnboardingStep1() {
  const router = useRouter();
  const { t } = useLanguage();

  // Prevenir navegación hacia atrás
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        return true; // Prevenir la navegación por defecto
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const handleNext = () => {
    router.push('/onboarding/step2');
  };

  return (
    // Si quieres un gradiente, envuelve todo con LinearGradient en lugar de View
    // <LinearGradient
    //   colors={['#FFF', '#F5F5F5']} // Ajusta tus colores de gradiente
    //   style={styles.container}
    // >
    <View style={styles.container}>

      {/* Imagen del logo como crupier en casino */}
      <Image 
        source={require('../../assets/images/crupier.png')}
        style={{ width: '100%', height: 390 }}
      />

      <Stack.Screen options={{ 
        headerShown: false,
        gestureEnabled: false // Deshabilitar gestos de navegación hacia atrás
      }} />

      {/* Título */}
      <Text style={styles.title}>{t('onboardingTitle1')}</Text>

      {/* Subtítulo */}
      <Text style={styles.subtitle}>
        {t('onboardingSubtitle1')}
      </Text>

      {/* Dots de paginación */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Botón de acción */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>{t('onboardingNext')}</Text>
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
  gif: {
    width: 200,
    height: 200,
  },
  illustration: {
    width: '100%',      // Ajusta según tus necesidades
    height: 450,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'center',
    marginHorizontal: 24,
    marginBottom: 32,
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
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
  },
  buttonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
});
