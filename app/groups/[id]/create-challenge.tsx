// app/groups/[id]/create-challenge.tsx
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/components/ThemeContext';
import { useAuth } from '@/store/auth-context';
import { useGroupsStore } from '@/store/groups-store';

import DateTimePicker from '@react-native-community/datetimepicker';

// Opcional: si tienes componentes de Input, Button, Card, etc.
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export default function CreateChallengeScreen() {
  const { id: groupId } = useLocalSearchParams<{ id: string }>(); 
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { createChallenge, isLoading } = useGroupsStore();

  // Campos del formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [initialPrize, setInitialPrize] = useState('0'); 

  // Almacenamos la fecha final como objeto Date
  const [endDate, setEndDate] = useState<Date | null>(null);
  // Controlan la visibilidad de los pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  // Almacena la fecha seleccionada en el primer paso en Android
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const [error, setError] = useState('');

  const handleCreateChallenge = async () => {
    setError('');
    if (!title.trim() || !description.trim() || !endDate) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (!user) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      // Creamos el objeto challenge
      const newChallenge = {
        title: title.trim(),
        description: description.trim(),
        initialPrize: parseInt(initialPrize, 10),
        // Convertimos endDate a ISO string
        endDate: endDate.toISOString(),
        createdBy: user.id,
        createdAt: new Date().toISOString(),
      };

      // Llamamos al método de nuestro store
      await createChallenge(groupId, newChallenge);
      Alert.alert('Challenge creado', '¡El reto ha sido creado correctamente!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err) {
      console.error('Error creando challenge:', err);
      setError('No se pudo crear el challenge');
    }
  };

  // iOS: Modo "datetime" en un solo picker
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
    // Guarda la fecha y abre el picker para la hora
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

  const handleShowDatePicker = () => {
    if (Platform.OS === 'ios') {
      setShowDatePicker(!showDatePicker);
    } else {
      setShowDatePicker(true);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Crear Challenge' }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          {error ? (
            <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
          ) : null}

          <Input
            label="Título"
            value={title}
            onChangeText={setTitle}
            placeholder="Título del reto"
          />

          <Input
            label="Descripción"
            value={description}
            onChangeText={setDescription}
            placeholder="Descripción del reto"
            multiline
            numberOfLines={3}
          />

          <Input
            label="Premio Inicial"
            value={initialPrize}
            onChangeText={setInitialPrize}
            placeholder="0"
            keyboardType="numeric"
          />

          {/* Campo de fecha/hora (imitamos Input) */}
          <View style={styles.dateFieldContainer}>
            <Text style={[styles.dateLabel, { color: colors.text }]}>
              Fecha de Finalización
            </Text>
            
            <TouchableOpacity
              style={[
                styles.dateTouchable,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.cardLight,
                },
              ]}
              onPress={handleShowDatePicker}
            >
              <Text
                style={[
                  styles.dateText,
                  { color: endDate ? colors.text : colors.textTertiary }
                ]}
              >
                {endDate 
                  ? endDate.toLocaleString() 
                  : 'Seleccionar fecha y hora'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Button
          title="Crear Challenge"
          onPress={handleCreateChallenge}
          style={styles.createButton}
          isLoading={isLoading}
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
    </SafeAreaView>
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
  createButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  error: {
    marginBottom: 8,
    textAlign: 'center',
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
