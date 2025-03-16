// app/groups/[id]/create-bet.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { supabase } from '@/services/supabaseClient';

export default function CreateBetScreen() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState('');
  const [options, setOptions] = useState(['']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (text: string, index: number) => {
    const newOptions = [...options];
    newOptions[index] = text;
    setOptions(newOptions);
  };

  const handleCreateBet = async () => {
    if (!title.trim()) {
      setError('Por favor ingresa un título para la apuesta');
      return;
    }
    if (options.some(opt => !opt.trim())) {
      setError('Todas las opciones deben tener un valor');
      return;
    }
    setIsLoading(true);
    try {
      // Obtener el usuario actual
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw userError || new Error('Usuario no encontrado');

      // Insertar la apuesta en la tabla bets
      const { data: betData, error: betError } = await supabase
        .from('bets')
        .insert([{
          group_id: groupId,
          created_by: userData.user.id,
          title: title.trim(),
          description: description.trim() || null,
          end_date: endDate ? new Date(endDate).toISOString() : null,
        }])
        .select();
      if (betError) throw betError;
      const betId = betData[0].id;

      // Insertar las opciones en la tabla bet_options
      const optionsToInsert = options.map(opt => ({
        bet_id: betId,
        option_text: opt.trim(),
      }));
      const { error: optionsError } = await supabase
        .from('bet_options')
        .insert(optionsToInsert);
      if (optionsError) throw optionsError;

      Alert.alert('Apuesta creada', 'La apuesta se ha creado correctamente', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: 'Crear Apuesta',
          headerLeft: () => (
            <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
              <Text style={{ color: colors.text }}>Atrás</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Input
            label="Título de la Apuesta"
            placeholder="Ingresa el título"
            value={title}
            onChangeText={setTitle}
          />
          <Input
            label="Descripción (opcional)"
            placeholder="Ingresa una descripción"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <Input
            label="Fecha de Finalización"
            placeholder="YYYY-MM-DD HH:MM"
            value={endDate}
            onChangeText={setEndDate}
          />
          <Text style={styles.optionsLabel}>Opciones</Text>
          {options.map((option, index) => (
            <Input
              key={index}
              placeholder={`Opción ${index + 1}`}
              value={option}
              onChangeText={(text) => handleOptionChange(text, index)}
            />
          ))}
          <TouchableOpacity onPress={handleAddOption} style={styles.addOptionButton}>
            <Text style={styles.addOptionText}>Añadir Opción</Text>
          </TouchableOpacity>
          <Button
            title="Crear Apuesta"
            onPress={handleCreateBet}
            isLoading={isLoading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBackButton: { marginRight: 8 },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24 },
  errorText: { color: colors.error, textAlign: 'center', marginBottom: 16 },
  optionsLabel: { fontSize: 16, fontWeight: '600', marginVertical: 8, color: colors.text },
  addOptionButton: { marginBottom: 16, alignSelf: 'flex-start' },
  addOptionText: { color: colors.primary, fontWeight: '600' },
});
