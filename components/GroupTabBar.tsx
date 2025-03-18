// components/GroupTabBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Home, Trophy, Award, MessageCircle } from 'lucide-react-native';

interface GroupTabBarProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
}

export function GroupTabBar({ activeTab, onChangeTab }: GroupTabBarProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const tabs = [
    { key: 'home', icon: Home, label: t('home') },
    { key: 'challenges', icon: Trophy, label: t('challenges') },
    { key: 'leaderboard', icon: Award, label: t('leaderboard') },
    { key: 'chat', icon: MessageCircle, label: t('chat') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;
        const IconComponent = tab.icon;
        
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onChangeTab(tab.key)}
          >
            <IconComponent
              size={22}
              color={isActive ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabLabel,
                { 
                  color: isActive ? colors.primary : colors.textSecondary,
                  fontWeight: isActive ? '600' : 'normal'
                }
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});