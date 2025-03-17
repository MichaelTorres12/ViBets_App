// app/groups/[id]/create-bet.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeContext';
import { useAuthStore } from '@/store/auth-store';
import { useGroupsStore } from '@/store/groups-store';
import { useBetsStore } from '@/store/bets-store';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { Plus, Trash2 } from 'lucide-react-native';

interface BetOption {
  text: string;
  odds: number;
}

export default function CreateBetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { getGroupById } = useGroupsStore();
  const { createBet } = useBetsStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState('');
  const [options, setOptions] = useState<BetOption[]>([
    { text: '', odds: 1 },
    { text: '', odds: 1 },
  ]);

  const group = getGroupById(id);

  if (!group || !user) {
    return null;
  }

  const handleAddOption = () => {
    setOptions([...options, { text: '', odds: 1 }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleUpdateOption = (index: number, field: keyof BetOption, value: string | number) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleCreateBet = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (options.some(opt => !opt.text.trim())) {
      Alert.alert('Error', 'Please fill in all options');
      return;
    }

    try {
      await createBet({
        groupId: id,
        title: title.trim(),
        description: description.trim(),
        endDate: endDate ? new Date(endDate).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        options: options.map(opt => ({
          text: opt.text.trim(),
          odds: opt.odds,
        })),
      });
      
      Alert.alert('Success', 'Bet created successfully!');
      router.back();
    } catch (error) {
      console.error('Error creating bet:', error);
      Alert.alert('Error', 'Failed to create bet. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'Create Bet',
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card}>
          <Input
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Enter bet title"
          />
          
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Enter bet description (optional)"
            multiline
            numberOfLines={3}
          />
          
          <Input
            label="End Date"
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD (optional)"
          />
        </Card>

        <Card style={styles.card}>
          <View style={styles.optionsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Options</Text>
            <Button
              title="Add Option"
              onPress={handleAddOption}
              size="small"
            />
          </View>

          {options.map((option, index) => (
            <View key={index} style={styles.optionContainer}>
              <Input
                label={`Option ${index + 1}`}
                value={option.text}
                onChangeText={(text) => handleUpdateOption(index, 'text', text)}
                placeholder="Enter option text"
              />
              
              <Input
                label="Odds"
                value={option.odds.toString()}
                onChangeText={(odds) => handleUpdateOption(index, 'odds', parseFloat(odds) || 1)}
                keyboardType="numeric"
                placeholder="Enter odds"
              />
              
              {options.length > 2 && (
                <Button
                  title="Remove"
                  onPress={() => handleRemoveOption(index)}
                  variant="outline"
                  size="small"
                />
              )}
            </View>
          ))}
        </Card>

        <Button
          title="Create Bet"
          onPress={handleCreateBet}
          style={styles.createButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
  optionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionContainer: {
    gap: 12,
    marginBottom: 16,
  },
  createButton: {
    margin: 16,
  },
});
