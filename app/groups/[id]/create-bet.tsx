// app/groups/[id]/create-bet.tsx
import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Text, 
  Platform, 
  TouchableOpacity 
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeContext';
import { useAuth } from '@/store/auth-context'
import { useGroupsStore } from '@/store/groups-store';
import { useBetsStore } from '@/store/bets-store';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import DateTimePicker from '@react-native-community/datetimepicker';

interface BetOption {
  text: string;
  odds: number;
}

export default function CreateBetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { getGroupById } = useGroupsStore();
  const { createBet } = useBetsStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Almacenamos la fecha final como objeto Date
  const [endDate, setEndDate] = useState<Date | null>(null);
  // Controlan la visibilidad de los pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  // Almacena la fecha seleccionada en el primer paso en Android
  const [tempDate, setTempDate] = useState<Date | null>(null);

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
        // Si no se selecciona fecha, se asigna 24h a partir del momento actual
        endDate: endDate 
          ? endDate.toISOString() 
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        options: options.map(opt => ({
          text: opt.text.trim(),
          odds: opt.odds,
        })),
      });
      
      Alert.alert('Success', 'Prediction created successfully!');
      router.back();
    } catch (error) {
      console.error('Error creating bet:', error);
      Alert.alert('Error', 'Failed to create bet. Please try again.');
    }
  };

  // iOS utiliza el picker en modo "datetime"
  const onChangeIOS = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  // Android: Primer paso, seleccionar la fecha
  const onChangeDateAndroid = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'dismissed' || selectedDate === undefined) {
      return;
    }
    // Guarda la fecha seleccionada y abre el picker para la hora
    setTempDate(selectedDate);
    setShowTimePicker(true);
  };

  // Android: Segundo paso, seleccionar la hora y combinar con la fecha
  const onChangeTimeAndroid = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (event.type === 'dismissed' || selectedTime === undefined || !tempDate) {
      setTempDate(null);
      return;
    }
    const combinedDate = new Date(
      tempDate.getFullYear(),
      tempDate.getMonth(),
      tempDate.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes()
    );
    setEndDate(combinedDate);
    setTempDate(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          title: 'Create Prediction',
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

          {/* Campo de fecha/hora con la misma apariencia que el Input */}
          <View style={styles.dateFieldContainer}>
            <Text style={[styles.dateLabel, { color: colors.text }]}>
              End Date
            </Text>
            
            <TouchableOpacity
              style={[
                styles.dateTouchable,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.cardLight,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={[
                  styles.dateText,
                  { color: endDate ? colors.text : colors.textTertiary }
                ]}
              >
                {endDate ? endDate.toLocaleString() : 'Select date and time'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.optionsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Options
            </Text>
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
                onChangeText={(odds) => handleUpdateOption(
                  index, 
                  'odds', 
                  parseFloat(odds) || 1
                )}
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
          title="Create Prediction"
          onPress={handleCreateBet}
          style={styles.createButton}
        />

        {/* iOS: Picker en modo "datetime" */}
        {Platform.OS === 'ios' && showDatePicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="datetime"
            display="default"
            onChange={onChangeIOS}
          />
        )}

        {/* Android: Picker para la fecha */}
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={onChangeDateAndroid}
          />
        )}

        {/* Android: Picker para la hora */}
        {Platform.OS === 'android' && showTimePicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="time"
            display="default"
            onChange={onChangeTimeAndroid}
          />
        )}
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
    margin: 10,
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

  // ---- Estilos para el campo de fecha/hora (imitan el Input) ----
  dateFieldContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  dateTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
  },
});
