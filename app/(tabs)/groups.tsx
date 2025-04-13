//app/(tabs)/groups.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/store/auth-context';
import { useGroupsStore } from '@/store/groups-store';
import { GroupCard } from '@/components/GroupCard';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { Plus, Search, Users, UserPlus } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';

export default function GroupsScreen() {
  const router = useRouter();
  const { user } = useAuth(); 
  const { groups, getUserGroups } = useGroupsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const { colors } = useTheme();
  const { t } = useLanguage();
  
  if (!user) {
    return null;
  }
  
  const userGroups = getUserGroups(user.id);
  
  const filteredGroups = searchQuery
    ? userGroups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : userGroups;
  
  const navigateToGroup = (groupId: string) => {
    router.push(`/groups/${groupId}`);
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('groups') || 'Groups'}
        </Text>
        <View style={styles.headerActions}>
          <Button
            title={t('joinGroup') || "Join"}
            variant="outline"
            size="small"
            leftIcon={<UserPlus size={16} color={colors.text} />}
            onPress={() => router.push('/groups/join')}
            style={styles.headerButton}
          />
          <Button
            title={t('createGroup') || "Create"}
            size="small"
            leftIcon={<Plus size={16} color={colors.textInverted} />}
            onPress={() => router.push('/groups/create')}
            style={styles.headerButton}
          />
        </View>
      </View>
      
      <View style={styles.searchContainer}>
        <Input
          placeholder={t('search') + " " + t('groups').toLowerCase() + "..."}
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={colors.textSecondary} />}
          containerStyle={styles.searchInputContainer}
        />
      </View>
      
      {filteredGroups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Card 
            style={[styles.emptyCard, { backgroundColor: colors.card }]} 
            gradient={false}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
              <Users size={36} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t('noGroups') || 'No groups yet'}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('noGroupsJoined') || 'Create a group or join one with your friends to start betting together.'}
            </Text>
            <View style={styles.emptyActions}>
              <Button
                title={t('createGroup')}
                onPress={() => router.push('/groups/create')}
                style={styles.emptyButton}
              />
              <Button
                title={t('joinGroup')}
                variant="outline"
                onPress={() => router.push('/groups/join')}
                style={styles.emptyButton}
              />
            </View>
          </Card>
        </View>
      ) : (
        <FlatList
          data={filteredGroups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              onPress={() => navigateToGroup(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    marginBottom: 0,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding for tab bar
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    width: '100%',
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    maxWidth: '90%',
  },
  emptyActions: {
    width: '100%',
    gap: 12,
  },
  emptyButton: {
    width: '100%',
  }
});