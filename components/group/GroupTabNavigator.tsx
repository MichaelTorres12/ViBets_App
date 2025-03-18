import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Home, Target, Award, Trophy, MessageCircle } from 'lucide-react-native';

interface GroupTabNavigatorProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
}

export function GroupTabNavigator({ activeTab, onChangeTab }: GroupTabNavigatorProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const tabs = [
    { id: 'home', icon: Home, label: t('home') || 'Home' },
    { id: 'bets', icon: Target, label: t('bets') || 'Bets' },
    { id: 'challenges', icon: Award, label: t('challenges') || 'Challenges' },
    { id: 'goats', icon: Trophy, label: t('goats') || 'GOATs' },
    { id: 'chat', icon: MessageCircle, label: t('chat') || 'Chat' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            onPress={() => onChangeTab(tab.id)}
          >
            <Icon
              size={22}
              color={isActive ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabLabel,
                { 
                  color: isActive ? colors.primary : colors.textSecondary,
                  fontWeight: isActive ? 'bold' : 'normal',
                },
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
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
  },
}); 