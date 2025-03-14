//app/groups/[id]/create-challenge.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useGroupsStore } from '@/store/groups-store';
import { Challenge, ChallengeTask } from '@/types';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Plus, Minus, Calendar, Target, Award, ChevronLeft } from 'lucide-react-native';

export default function CreateChallengeScreen() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const { createChallenge, isLoading } = useGroupsStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('500 coins');
  const [endDate, setEndDate] = useState('7 days');
  const [tasks, setTasks] = useState<Omit<ChallengeTask, 'id'>[]>([
    { description: '', total: 1, progress: 0, reward: '100 coins' },
    { description: '', total: 1, progress: 0, reward: '100 coins' },
  ]);
  const [error, setError] = useState('');
  
  const handleAddTask = () => {
    setTasks([...tasks, { description: '', total: 1, progress: 0, reward: '100 coins' }]);
  };
  
  const handleRemoveTask = (index: number) => {
    if (tasks.length <= 1) {
      setError('A challenge must have at least one task');
      return;
    }
    
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };
  
  const handleTaskDescriptionChange = (text: string, index: number) => {
    const newTasks = [...tasks];
    newTasks[index].description = text;
    setTasks(newTasks);
  };
  
  const handleTaskTotalChange = (text: string, index: number) => {
    const newTasks = [...tasks];
    const total = parseInt(text);
    if (!isNaN(total) && total > 0) {
      newTasks[index].total = total;
      setTasks(newTasks);
    }
  };
  
  const handleTaskRewardChange = (text: string, index: number) => {
    const newTasks = [...tasks];
    newTasks[index].reward = text;
    setTasks(newTasks);
  };
  
  const handleCreateChallenge = async () => {
    if (!title) {
      setError('Please enter a challenge title');
      return;
    }
    
    if (!description) {
      setError('Please enter a challenge description');
      return;
    }
    
    if (tasks.some(task => !task.description)) {
      setError('All tasks must have a description');
      return;
    }
    
    try {
      // Create tasks with IDs
      const tasksWithIds: ChallengeTask[] = tasks.map((task, index) => ({
        ...task,
        id: `t${index + 1}`,
      }));
      
      const newChallenge: Omit<Challenge, 'id'> = {
        title,
        description,
        reward,
        progress: 0,
        endDate,
        createdBy: '1', // Asumiendo que el usuario actual es '1'
        tasks: tasksWithIds,
        createdAt: new Date().toISOString(), // Se agrega la fecha de creación
      };
      
      await createChallenge(groupId, newChallenge);
      
      Alert.alert(
        'Challenge Created',
        'Your challenge has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err) {
      setError('Failed to create challenge. Please try again.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: 'Create Challenge',
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
            <Text style={styles.title}>Create a New Challenge</Text>
            <Text style={styles.subtitle}>
              Set up a challenge for your group members to complete and earn rewards.
            </Text>
          </View>
          
          <View style={styles.formContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <Input
              label="Challenge Title"
              placeholder="What is this challenge about?"
              value={title}
              onChangeText={setTitle}
            />
            
            <Input
              label="Description"
              placeholder="Explain the challenge in detail"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              inputStyle={styles.textArea}
            />
            
            <View style={styles.rewardContainer}>
              <Input
                label="Reward"
                placeholder="e.g. 500 coins"
                value={reward}
                onChangeText={setReward}
                containerStyle={styles.rewardInput}
              />
              
              <Input
                label="Duration"
                placeholder="e.g. 7 days"
                value={endDate}
                onChangeText={setEndDate}
                containerStyle={styles.durationInput}
              />
            </View>
            
            <Text style={styles.label}>Tasks</Text>
            <Card style={styles.tasksCard}>
              {tasks.map((task, index) => (
                <View key={index} style={styles.taskContainer}>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskNumber}>Task {index + 1}</Text>
                    <TouchableOpacity
                      style={styles.removeTaskButton}
                      onPress={() => handleRemoveTask(index)}
                    >
                      <Minus size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                  
                  <Input
                    placeholder="Task description"
                    value={task.description}
                    onChangeText={(text) => handleTaskDescriptionChange(text, index)}
                    containerStyle={styles.taskInput}
                  />
                  
                  <View style={styles.taskDetails}>
                    <Input
                      label="Target"
                      placeholder="1"
                      value={task.total.toString()}
                      onChangeText={(text) => handleTaskTotalChange(text, index)}
                      keyboardType="numeric"
                      containerStyle={styles.taskTargetInput}
                    />
                    
                    <Input
                      label="Reward"
                      placeholder="100 coins"
                      value={task.reward}
                      onChangeText={(text) => handleTaskRewardChange(text, index)}
                      containerStyle={styles.taskRewardInput}
                    />
                  </View>
                </View>
              ))}
              
              <Button
                title="Add Task"
                variant="outline"
                size="small"
                leftIcon={<Plus size={16} color={colors.primary} />}
                onPress={handleAddTask}
                style={styles.addTaskButton}
              />
            </Card>
            
            <Button
              title="Create Challenge"
              onPress={handleCreateChallenge}
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
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
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
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  rewardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rewardInput: {
    flex: 1,
  },
  durationInput: {
    flex: 1,
  },
  tasksCard: {
    padding: 16,
  },
  taskContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  removeTaskButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskInput: {
    marginBottom: 8,
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  taskTargetInput: {
    flex: 1,
  },
  taskRewardInput: {
    flex: 2,
  },
  addTaskButton: {
    marginTop: 8,
  },
  createButton: {
    marginTop: 24,
  },
});