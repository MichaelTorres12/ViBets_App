import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

export type Language = 'en' | 'es';

// Function to detect device language and return appropriate app language
const getDeviceLanguage = (): Language => {
  // Get device locale (e.g., "en-US", "es-ES", etc.)
  const locale = Localization.locale;
  
  // Extract the language code (first two characters)
  const deviceLanguage = locale.split('-')[0];
  
  // Check if the device language is supported, otherwise default to English
  return deviceLanguage === 'es' ? 'es' : 'en';
};

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      // Use device language as the default
      language: getDeviceLanguage(),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);