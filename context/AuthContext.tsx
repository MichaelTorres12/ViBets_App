import React, { createContext, useState, useEffect, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';

export interface AuthContextType {
  userToken: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  login: async () => {},
  logout: async () => {},
  isLoading: true,
  hasSeenOnboarding: false,
  completeOnboarding: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Carga el token de autenticación y el estado del onboarding al iniciar la app
  const loadAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const onboardingStatus = await SecureStore.getItemAsync('hasSeenOnboarding');
      if (token) {
        setUserToken(token);
      }
      if (onboardingStatus === 'true') {
        setHasSeenOnboarding(true);
      }
    } catch (error) {
      console.error('Error al cargar el estado de autenticación', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuthState();
  }, []);

  // Función para loguear al usuario y guardar el token de sesión
  const login = async (token: string) => {
    await SecureStore.setItemAsync('userToken', token);
    setUserToken(token);
  };

  // Función para cerrar sesión y eliminar el token
  const logout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    setUserToken(null);
  };

  // Función para marcar que se completó el onboarding
  const completeOnboarding = async () => {
    await SecureStore.setItemAsync('hasSeenOnboarding', 'true');
    setHasSeenOnboarding(true);
  };

  const authContextValue = useMemo(() => ({
    userToken,
    login,
    logout,
    isLoading,
    hasSeenOnboarding,
    completeOnboarding,
  }), [userToken, isLoading, hasSeenOnboarding]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 