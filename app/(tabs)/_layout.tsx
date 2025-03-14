//app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { TabBar } from '@/components/TabBar';
import { Home, Users, Trophy, User } from 'lucide-react-native';
import { useLanguage } from '@/components/LanguageContext';

export default function TabsLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 90 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
      tabBar={props => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: t('groups'),
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bets"
        options={{
          title: t('bets'),
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}