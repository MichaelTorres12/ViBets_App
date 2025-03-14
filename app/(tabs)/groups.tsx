//app/(tabs)/groups.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useGroupsStore } from '@/store/groups-store';
import { GroupCard } from '@/components/GroupCard';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { Plus, Search, Users, UserPlus } from 'lucide-react-native';

export default function GroupsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { groups, getUserGroups } = useGroupsStore();
  const [searchQuery, setSearchQuery] = useState('');
  
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
        <View style={styles.headerActions}>
          <Button
            title="Join"
            variant="outline"
            size="small"
            leftIcon={<UserPlus size={16} color={colors.text} />}
            onPress={() => router.push('/groups/join')}
            style={styles.headerButton}
          />
          <Button
            title="Create"
            size="small"
            leftIcon={<Plus size={16} color="#000000" />}
            onPress={() => router.push('/groups/create')}
            style={styles.headerButton}
          />
        </View>
      </View>
      
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search groups..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={colors.textSecondary} />}
          containerStyle={styles.searchInputContainer}
        />
      </View>
      
      {filteredGroups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Card style={styles.emptyCard} gradient>
            <Users size={48} color={colors.primary} />
            <Text style={styles.emptyTitle}>No groups yet</Text>
            <Text style={styles.emptyText}>
              Create a group or join one with your friends to start betting together.
            </Text>
            <View style={styles.emptyActions}>
              <Button
                title="Create Group"
                onPress={() => router.push('/groups/create')}
                style={styles.emptyButton}
              />
              <Button
                title="Join Group"
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
    backgroundColor: colors.background,
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
    color: colors.text,
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
    padding: 24,
    width: '100%',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyActions: {
    width: '100%',
    gap: 12,
  },
  emptyButton: {
    width: '100%',
  }
});