import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/components/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined' | 'dark';
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  gradient = false,
}) => {
  const { colors } = useTheme();
  
  const getCardStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'dark':
        return {
          backgroundColor: colors.background,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        };
      default:
        return {
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
        };
    }
  };
  
  if (gradient) {
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={[getCardStyle(), style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {children}
      </LinearGradient>
    );
  }
  
  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};