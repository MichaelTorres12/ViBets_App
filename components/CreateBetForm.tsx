// components/CreateBetForm.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useGroupsStore } from '@/store/groups-store';
import { useBetsStore } from '@/store/bets-store';
import { BetType } from '@/types';
import { Input } from './Input';
import { Button } from './Button';
import { Card } from './Card';
import { Plus, Minus, Calendar, Trophy, Dices } from 'lucide-react-native';
import { useLanguage } from './LanguageContext';

const CreateBetForm: React.FC = () => {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { getGroupById, getGroupMember } = useGroupsStore();
  const { createBet, isLoading } = useBetsStore();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [betType, setBetType] = useState<BetType>('binary');
  const [options, setOptions] = useState([
    { text: 'Yes', odds: undefined },
    { text: 'No', odds: undefined },
  ]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000).toISOString());
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const group = useMemo(() => getGroupById(groupId), [getGroupById, groupId]);
  const groupMember = useMemo(() => (user ? getGroupMember(groupId, user.id) : null), [user, getGroupMember, groupId]);
  const userGroupCoins = useMemo(() => groupMember?.groupCoins || 0, [groupMember]);

  const handleAddOption = useCallback(() => {
    setOptions(prev => [...prev, { text: '', odds: undefined }]);
  }, []);

  const handleRemoveOption = useCallback(
    (index: number) => {
      if (options.length <= 2) {
        setError(t('betMinOptionsError') || 'A bet must have at least 2 options');
        return;
      }
      setOptions(prev => {
        const newOptions = [...prev];
        newOptions.splice(index, 1);
        return newOptions;
      });
    },
    [options.length, t]
  );

  const handleOptionChange = useCallback((text: string, index: number) => {
    setOptions(prev => {
      const newOptions = [...prev];
      newOptions[index].text = text;
      return newOptions;
    });
  }, []);

  const handleCreateBet = useCallback(async () => {
    if (!user) {
      setError(t('loginRequired') || 'You must be logged in to create a bet');
      return;
    }
    if (!title) {
      setError(t('betTitleRequired') || 'Please enter a bet title');
      return;
    }
    if (options.some(option => !option.text)) {
      setError(t('betOptionsRequired') || 'All options must have text');
      return;
    }
    try {
      setLocalLoading(true);
      const newBet = await createBet(title, groupId, betType, options, endDate, description);
      if (newBet) {
        router.push(`/bets/${newBet.id}`);
      }
    } catch (err) {
      console.error('Error creating bet:', err);
      setError(t('betCreateError') || 'Failed to create bet. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  }, [user, title, options, groupId, betType, endDate, description, createBet, router, t]);

  const renderBetTypeSelector = useCallback(() => {
    return (
      <View style={styles.betTypeContainer}>
        <Text style={styles.label}>{t('betType') || 'Bet Type'}</Text>
        <View style={styles.betTypeOptions}>
          <TouchableOpacity
            style={[styles.betTypeOption, betType === 'binary' && styles.betTypeOptionActive]}
            onPress={() => {
              setBetType('binary');
              setOptions([
                { text: t('yes') || 'Yes', odds: undefined },
                { text: t('no') || 'No', odds: undefined },
              ]);
            }}
          >
            <Trophy size={24} color={betType === 'binary' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.betTypeText, betType === 'binary' && styles.betTypeTextActive]}>
              {t('binary') || 'Binary'}
            </Text>
            <Text style={[styles.betTypeDescription, betType === 'binary' && styles.betTypeDescriptionActive]}>
              {t('binaryDescription') || 'Yes/No outcome'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.betTypeOption, betType === 'multiple' && styles.betTypeOptionActive]}
            onPress={() => {
              setBetType('multiple');
              setOptions([
                { text: t('option') + ' 1' || 'Option 1', odds: undefined },
                { text: t('option') + ' 2' || 'Option 2', odds: undefined },
                { text: t('option') + ' 3' || 'Option 3', odds: undefined },
              ]);
            }}
          >
            <Dices size={24} color={betType === 'multiple' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.betTypeText, betType === 'multiple' && styles.betTypeTextActive]}>
              {t('multiple') || 'Multiple'}
            </Text>
            <Text style={[styles.betTypeDescription, betType === 'multiple' && styles.betTypeDescriptionActive]}>
              {t('multipleDescription') || 'Multiple options'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.betTypeOption, betType === 'custom' && styles.betTypeOptionActive]}
            onPress={() => {
              setBetType('custom');
              setOptions([{ text: '', odds: undefined }, { text: '', odds: undefined }]);
            }}
          >
            <Calendar size={24} color={betType === 'custom' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.betTypeText, betType === 'custom' && styles.betTypeTextActive]}>
              {t('custom') || 'Custom'}
            </Text>
            <Text style={[styles.betTypeDescription, betType === 'custom' && styles.betTypeDescriptionActive]}>
              {t('customDescription') || 'Create your own'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [betType, t]);

  return (
    <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('createNewBet') || 'Create a New Bet'}</Text>
          <Text style={styles.subtitle}>
            {t('createBetSubtitle') || 'Set up a bet for your group members to participate in.'}
          </Text>
          <View style={styles.coinsInfo}>
            <Text style={styles.coinsLabel}>{t('yourGroupCoins') || 'Your Group Coins'}:</Text>
            <Text style={styles.coinsValue}>{userGroupCoins}</Text>
          </View>
        </View>
        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Input label={t('betTitle') || 'Bet Title'} placeholder={t('betTitlePlaceholder') || 'What are you betting on?'} value={title} onChangeText={setTitle} />
          <Input
            label={t('description') || 'Description (Optional)'}
            placeholder={t('descriptionPlaceholder') || 'Add more details about this bet'}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            inputStyle={styles.textArea}
          />
          {renderBetTypeSelector()}
          <Text style={styles.label}>{t('betOptions') || 'Bet Options'}</Text>
          <Card style={styles.optionsCard}>
            {options.map((option, index) => (
              <View key={index} style={styles.optionContainer}>
                <Input placeholder={`${t('option') || 'Option'} ${index + 1}`} value={option.text} onChangeText={(text) => handleOptionChange(text, index)} containerStyle={styles.optionInput} />
                <TouchableOpacity style={styles.removeOptionButton} onPress={() => handleRemoveOption(index)}>
                  <Minus size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            <Button title={t('addOption') || 'Add Option'} variant="outline" size="small" leftIcon={<Plus size={16} color={colors.primary} />} onPress={handleAddOption} style={styles.addOptionButton} />
          </Card>
          <Button title={t('createBet') || 'Create Bet'} onPress={handleCreateBet} isLoading={localLoading} style={styles.createButton} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateBetForm;

const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { padding: 16 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 16 },
  coinsInfo: { flexDirection: 'row', alignItems: 'center' },
  coinsLabel: { fontSize: 14, color: colors.text, marginRight: 8 },
  coinsValue: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
  formContainer: {},
  errorText: { color: colors.error, marginBottom: 16, fontSize: 14 },
  textArea: { height: 80, textAlignVertical: 'top' },
  label: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8, marginTop: 16 },
  betTypeContainer: { marginBottom: 16 },
  betTypeOptions: { flexDirection: 'row', justifyContent: 'space-between' },
  betTypeOption: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  betTypeOptionActive: { backgroundColor: colors.primary },
  betTypeText: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 8 },
  betTypeTextActive: { color: '#FFFFFF' },
  betTypeDescription: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  betTypeDescriptionActive: { color: 'rgba(255, 255, 255, 0.8)' },
  optionsCard: { padding: 16, marginBottom: 24 },
  optionContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  optionInput: { flex: 1, marginRight: 8 },
  removeOptionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addOptionButton: { marginTop: 8 },
  createButton: { marginTop: 16 },
});
