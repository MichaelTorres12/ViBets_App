//app/groups/create.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useGroupsStore } from '@/store/groups-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Users, ChevronLeft } from 'lucide-react-native';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { createGroup, isLoading } = useGroupsStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  
  const handleCreateGroup = async () => {
    if (!name) {
      setError('Please enter a group name');
      return;
    }
    
    try {
      const newGroup = await createGroup(name, description);
      router.push(`/groups/${newGroup.id}`);
    } catch (err) {
      setError('Failed to create group. Please try again.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: 'Create Group',
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
              <Users size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Create a New Group</Text>
            <Text style={styles.subtitle}>
              Create a group to start betting with your friends. You'll get a unique invite code to share.
            </Text>
          </View>
          
          <View style={styles.formContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <Input
              label="Group Name"
              placeholder="Enter a name for your group"
              value={name}
              onChangeText={setName}
            />
            
            <Input
              label="Description (Optional)"
              placeholder="What's this group about?"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              inputStyle={styles.textArea}
            />
            
            <Button
              title="Create Group"
              onPress={handleCreateGroup}
              isLoading={isLoading}
              style={styles.createButton}
            />
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
    backgroundColor: colors.primary,
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
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  createButton: {
    marginTop: 16,
  },
});