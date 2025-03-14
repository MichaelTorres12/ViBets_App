//components/Avatar.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 40,
  style,
}) => {
  const getInitials = (name?: string): string => {
    if (!name) return '?';
    
    const parts = name.split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  
  const getRandomColor = (name?: string): string => {
    if (!name) return colors.primary; // Usa el colors importado
    const colorOptions = [
      '#DDFF00', // Neon yellow/green
      '#00E676', // success
      '#FF3D71', // error
      '#FFAA00', // warning
    ];
    const index = name.charCodeAt(0) % colorOptions.length;
    return colorOptions[index];
  };
  
  
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        />
      ) : (
        <LinearGradient
          colors={['#000000', '#1A1A1A']}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: getRandomColor(name),
          }}
        >
          <Text
            style={[
              styles.initials,
              {
                fontSize: size * 0.4,
                color: getRandomColor(name),
              },
            ]}
          >
            {getInitials(name)}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontWeight: 'bold',
  },
});