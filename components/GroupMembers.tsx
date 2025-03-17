import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { GroupMember } from '@/types';

interface GroupMembersProps {
  members: GroupMember[];
}

export function GroupMembers({ members }: GroupMembersProps) {
  const { colors } = useTheme();

  const renderMember = ({ item }: { item: GroupMember }) => (
    <View style={[styles.memberContainer, { backgroundColor: colors.card }]}>
      <View style={styles.memberInfo}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {item.username?.substring(0, 2).toUpperCase() || '??'}
          </Text>
        </View>
        <View>
          <Text style={[styles.memberName, { color: colors.text }]}>
            {item.username || 'Unknown User'}
          </Text>
          <Text style={[styles.memberCoins, { color: colors.textSecondary }]}>
            {item.groupCoins.toLocaleString()} coins
          </Text>
        </View>
      </View>
      <Text style={[styles.joinDate, { color: colors.textSecondary }]}>
        Joined {new Date(item.joinedAt).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Members</Text>
      <FlatList
        data={members}
        renderItem={renderMember}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  memberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberCoins: {
    fontSize: 14,
  },
  joinDate: {
    fontSize: 12,
  },
}); 