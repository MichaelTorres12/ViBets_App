import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useGroupsStore } from '@/store/groups-store';
import { useBetsStore } from '@/store/bets-store';
import { BetType } from '@/types';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Plus, Minus, Calendar, Trophy, Dices, ChevronLeft } from 'lucide-react-native';

export default function CreateBetScreen() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const { getGroupMember } = useGroupsStore();
  const { createBet, isLoading } = useBetsStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [betType, setBetType] = useState<BetType>('binary');
  const [options, setOptions] = useState([
    { text: 'Yes', odds: undefined },
    { text: 'No', odds: undefined },
  ]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000).toISOString() // 24 hours from now
  );
  const [error, setError] = useState('');
  
  // Get user's group-specific coins
  const groupMember = getGroupMember(groupId, '1'); // Assuming current user has ID 1
  const userGroupCoins = groupMember?.groupCoins || 0;
  
  const handleAddOption = () => {
    setOptions([...options, { text: '', odds: undefined }]);
  };
  
  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      setError('A bet must have at least 2 options');
      return;
    }
    
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };
  
  const handleOptionChange = (text: string, index: number) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };
  
  const handleCreateBet = async () => {
    if (!title) {
      setError('Please enter a bet title');
      return;
    }
    
    if (options.some(option => !option.text)) {
      setError('All options must have text');
      return;
    }
    
    try {
      const newBet = await createBet(
        title,
        groupId,
        betType,
        options,
        endDate,
        description
      );
      
      router.push(`/bets/${newBet.id}`);
    } catch (err) {
      setError('Failed to create bet. Please try again.');
    }
  };
  
  const renderBetTypeSelector = () => {
    return (
      <View style={styles.betTypeContainer}>
        <Text style={styles.label}>Bet Type</Text>
        
        <View style={styles.betTypeOptions}>
          <TouchableOpacity
            style={[
              styles.betTypeOption,
              betType === 'binary' && styles.betTypeOptionActive,
            ]}
            onPress={() => {
              setBetType('binary');
              setOptions([
                { text: 'Yes', odds: undefined },
                { text: 'No', odds: undefined },
              ]);
            }}
          >
            <Trophy size={24} color={betType === 'binary' ? '#FFFFFF' : colors.textSecondary} />
            <Text
              style={[
                styles.betTypeText,
                betType === 'binary' && styles.betTypeTextActive,
              ]}
            >
              Binary
            </Text>
            <Text
              style={[
                styles.betTypeDescription,
                betType === 'binary' && styles.betTypeDescriptionActive,
              ]}
            >
              Yes/No outcome
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.betTypeOption,
              betType === 'multiple' && styles.betTypeOptionActive,
            ]}
            onPress={() => {
              setBetType('multiple');
              setOptions([
                { text: 'Option 1', odds: undefined },
                { text: 'Option 2', odds: undefined },
                { text: 'Option 3', odds: undefined },
              ]);
            }}
          >
            <Dices size={24} color={betType === 'multiple' ? '#FFFFFF' : colors.textSecondary} />
            <Text
              style={[
                styles.betTypeText,
                betType === 'multiple' && styles.betTypeTextActive,
              ]}
            >
              Multiple
            </Text>
            <Text
              style={[
                styles.betTypeDescription,
                betType === 'multiple' && styles.betTypeDescriptionActive,
              ]}
            >
              Multiple options
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.betTypeOption,
              betType === 'custom' && styles.betTypeOptionActive,
            ]}
            onPress={() => {
              setBetType('custom');
              setOptions([
                { text: '', odds: undefined },
                { text: '', odds: undefined },
              ]);
            }}
          >
            <Calendar size={24} color={betType === 'custom' ? '#FFFFFF' : colors.textSecondary} />
            <Text
              style={[
                styles.betTypeText,
                betType === 'custom' && styles.betTypeTextActive,
              ]}
            >
              Custom
            </Text>
            <Text
              style={[
                styles.betTypeDescription,
                betType === 'custom' && styles.betTypeDescriptionActive,
              ]}
            >
              Create your own
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: 'Create Bet',
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
            <Text style={styles.title}>Create a New Bet</Text>
            <Text style={styles.subtitle}>
              Set up a bet for your group members to participate in.
            </Text>
            <View style={styles.coinsInfo}>
              <Text style={styles.coinsLabel}>Your Group Coins:</Text>
              <Text style={styles.coinsValue}>{userGroupCoins}</Text>
            </View>
          </View>
          
          <View style={styles.formContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <Input
              label="Bet Title"
              placeholder="What are you betting on?"
              value={title}
              onChangeText={setTitle}
            />
            
            <Input
              label="Description (Optional)"
              placeholder="Add more details about this bet"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              inputStyle={styles.textArea}
            />
            
            {renderBetTypeSelector()}
            
            <Text style={styles.label}>Bet Options</Text>
            <Card style={styles.optionsCard}>
              {options.map((option, index) => (
                <View key={index} style={styles.optionContainer}>
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChangeText={(text) => handleOptionChange(text, index)}
                    containerStyle={styles.optionInput}
                  />
                  <TouchableOpacity
                    style={styles.removeOptionButton}
                    onPress={() => handleRemoveOption(index)}
                  >
                    <Minus size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              
              <Button
                title="Add Option"
                variant="outline"
                size="small"
                leftIcon={<Plus size={16} color={colors.primary} />}
                onPress={handleAddOption}
                style={styles.addOptionButton}
              />
            </Card>
            
            <Button
              title="Create Bet"
              onPress={handleCreateBet}
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
  headerBackText: {
    fontSize: 16,
    color: colors.primary,
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
    marginBottom: 12,
  },
  coinsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  coinsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
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
  betTypeContainer: {
    marginBottom: 16,
  },
  betTypeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  betTypeOption: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  betTypeOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  betTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  betTypeTextActive: {
    color: '#FFFFFF',
  },
  betTypeDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  betTypeDescriptionActive: {
    color: '#FFFFFF',
  },
  optionsCard: {
    padding: 16,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    marginBottom: 8,
  },
  removeOptionButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addOptionButton: {
    marginTop: 8,
  },
  createButton: {
    marginTop: 24,
  },
});