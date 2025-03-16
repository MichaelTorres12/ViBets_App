// app/groups/[id]/create-bet.tsx
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import CreateBetForm from '@/components/CreateBetForm'

export default function CreateBetScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Definimos la cabecera con Stack.Screen */}
      <Stack.Screen
        options={{
          title: 'Create Bet',
          headerLeft: () => (
            <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      {/* Aquí incluimos el formulario separado */}
      <CreateBetForm />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerBackButton: {
    marginLeft: 8,
  },
});
