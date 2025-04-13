// app/groups/join.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useGroupsStore } from '@/store/groups-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { UserPlus, ChevronLeft, HelpCircle } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Card } from '@/components/Card';

export default function JoinGroupScreen() {
  const router = useRouter();
  const { joinGroup, isLoading } = useGroupsStore();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const { colors, theme } = useTheme();
  const { t } = useLanguage();
  const isLight = theme === 'light';

  // Prevenir la navegación hacia atrás con el botón físico
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Navegar a la página principal en lugar de volver atrás
        router.replace('/(tabs)');
        return true; // Prevenir la navegación por defecto
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [router])
  );

  const handleJoinGroup = async () => {
    if (!inviteCode) {
      setError(t('pleaseEnterInviteCode') || 'Please enter an invite code');
      return;
    }
    try {
      const group = await joinGroup(inviteCode);
      if (group) {
        router.replace(`/groups/${group.id}`);
      }
    } catch (err) {
      setError(t('invalidInviteCode') || 'Invalid invite code or you are already a member');
    }
  };

  // Modificar el manejo del botón de regresar
  const handleBack = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: t('joinExistingGroup') || 'Join Group',
          headerTitleStyle: { fontWeight: '600', color: colors.text },
          headerStyle: { backgroundColor: colors.background },
          headerLeft: () => (
            <TouchableOpacity style={styles.headerBackButton} onPress={handleBack}>
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          // Deshabilitar gestos de navegación hacia atrás
          gestureEnabled: false
        }} 
      />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { 
              backgroundColor: colors.secondary,
              shadowColor: colors.secondary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isLight ? 0.2 : 0.4,
              shadowRadius: 8,
              elevation: 6
            }]}>
              <UserPlus size={32} color={isLight ? colors.background : "#FFFFFF"} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('joinGroup') || 'Join a Group'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('joinGroupDescription') || 'Enter the invite code shared by your friend to join their betting group.'}
            </Text>
          </View>
          
          <View style={styles.formContainer}>
            {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}
            
            <Input
              label={t('inviteCode') || "Invite Code"}
              placeholder={t('enterInviteCode') || "Enter the 6-digit invite code"}
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
            />
            
            <Button
              title={t('joinGroup') || "Join Group"}
              onPress={handleJoinGroup}
              isLoading={isLoading}
              style={styles.joinButton}
              variant="primary"
            />
          </View>
          
          <Card 
            style={[styles.infoContainer, { 
              backgroundColor: isLight ? 
                `${colors.primary}10` : 
                `${colors.cardLight}80`
            }]} 
            variant="outlined"
          >
            <View style={styles.infoHeaderRow}>
              <HelpCircle size={18} color={colors.primary} style={styles.infoIcon} />
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                {t('howToGetInviteCode') || 'How to get an invite code?'}
              </Text>
            </View>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {t('inviteCodeInstructions') || 'Ask your friend to share their group\'s invite code with you. They can find it in the group details screen.'}
            </Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  headerBackButton: { 
    marginRight: 8 
  },
  keyboardAvoidingView: { 
    flex: 1 
  },
  scrollContent: { 
    flexGrow: 1, 
    padding: 24 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 32 
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 16, 
    textAlign: 'center',
    marginHorizontal: 16,
    lineHeight: 22,
  },
  formContainer: { 
    marginBottom: 24 
  },
  errorText: { 
    marginBottom: 16, 
    textAlign: 'center',
    fontWeight: '500',
  },
  joinButton: { 
    marginTop: 16 
  },
  infoContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoTitle: { 
    fontSize: 16, 
    fontWeight: '600',
  },
  infoText: { 
    fontSize: 14, 
    lineHeight: 20 
  },
});
