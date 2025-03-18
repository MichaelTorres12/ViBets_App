//components/GroupInfo.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Group } from '@/types';
import { useTheme } from '@/components/ThemeContext';
import { Copy, Users, Calendar, Key } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

interface GroupInfoProps {
  group: Group;
  onShareInvite: () => void;
}

export function GroupInfo({ group, onShareInvite }: GroupInfoProps) {
  const { colors } = useTheme();

  const copyInviteCode = async () => {
    await Clipboard.setStringAsync(group.inviteCode);
  };

  return (
    <View style={styles.container}>
      {/* Header with Avatar and Name */}
      <View style={styles.header}>
        {/* Group Avatar */}
        <View style={styles.avatarContainer}>
          {group.avatar ? (
            <Image source={{ uri: group.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.card }]}>
              <Text style={[styles.avatarText, { color: colors.text }]}>
                {group.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Group Name and Description */}
        <View style={styles.infoContainer}>
          <Text style={[styles.name, { color: colors.text }]}>{group.name}</Text>
          {group.description && (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
              {group.description}
            </Text>
          )}
        </View>
      </View>

      {/* Group Stats */}
      <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
        <View style={styles.statItem}>
          <Users size={18} color={colors.textSecondary} />
          <Text style={[styles.statText, { color: colors.text }]}>
            {group.members.length} members
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Calendar size={18} color={colors.textSecondary} />
          <Text style={[styles.statText, { color: colors.text }]}>
            {new Date(group.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Invite Code */}
      <TouchableOpacity
        style={[styles.inviteContainer, { backgroundColor: colors.card }]}
        onPress={copyInviteCode}
      >
        <View style={styles.inviteHeader}>
          <Key size={18} color={colors.primary} />
          <Text style={[styles.inviteTitle, { color: colors.text }]}>
            Group Code
          </Text>
        </View>
        <View style={styles.inviteCodeContainer}>
          <Text style={[styles.inviteCode, { color: colors.text }]}>
            {group.inviteCode}
          </Text>
          <Copy size={18} color={colors.primary} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 65,
    height: 65,
    borderRadius: 40,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.3)',
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inviteContainer: {
    borderRadius: 12,
    padding: 16,
  },
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inviteTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  inviteCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  inviteCode: {
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 1,
  },
  inviteHint: {
    fontSize: 12,
    textAlign: 'right',
  },
}); 