//components/TapBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useLanguage } from '@/components/LanguageContext';
import { useTheme } from '@/components/ThemeContext';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Get the tab icon
        const Icon = options.tabBarIcon ? options.tabBarIcon : null;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            //testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            {Icon &&
              Icon({
                focused: isFocused,
                color: isFocused ? colors.primary : colors.textSecondary,
                size: 24,
              })}
              <Text style={[styles.label, { color: isFocused ? colors.primary : colors.textSecondary, fontWeight: isFocused ? '600' : '400' }]}>
                {typeof label === 'string'
                  ? t(label.toLowerCase())
                  : typeof label === 'function'
                    ? label({ focused: isFocused, color: isFocused ? colors.primary : colors.textSecondary, position: 'below-icon', children: t(label.toString()) })
                    : label}
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
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
});