import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useGroupsStore } from '@/store/groups-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { UserPlus, ChevronLeft } from 'lucide-react-native';

export default function JoinGroupScreen() {
  const router = useRouter();
  const { joinGroup, isLoading } = useGroupsStore();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  
  const handleJoinGroup = async () => {
    if (!inviteCode) {
      setError('Please enter an invite code');
      return;
    }
    
    try {
      const group = await joinGroup(inviteCode);
      router.push(`/groups/${group.id}`);
    } catch (err) {
      setError('Invalid invite code or you are already a member');
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: 'Join Group',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerBackButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <UserPlus size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Join a Group</Text>
            <Text style={styles.subtitle}>
              Enter the invite code shared by your friend to join their betting group.
            </Text>
          </View>
          
          <View style={styles.formContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <Input
              label="Invite Code"
              placeholder="Enter the 6-digit invite code"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
            />
            
            <Button
              title="Join Group"
              onPress={handleJoinGroup}
              isLoading={isLoading}
              style={styles.joinButton}
            />
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>How to get an invite code?</Text>
            <Text style={styles.infoText}>
              Ask your friend to share their group's invite code with you. They can find it in the group details screen.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBackButton: {
    marginRight: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 24,
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  joinButton: {
    marginTop: 16,
  },
  infoContainer: {
    backgroundColor: colors.primaryLight + '20', // 20% opacity
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});