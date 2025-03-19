import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/services/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

// Claves para almacenamiento seguro
const AUTH_TOKEN_KEY = 'auth-token';
const HAS_SEEN_ONBOARDING_KEY = 'has-seen-onboarding';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error?: any, data?: any }>;
  signOut: () => Promise<void>;
  setHasSeenOnboarding: (value: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(false);

  // Guardar el token de sesión de forma segura
  const saveSessionToken = async (session: Session) => {
    try {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session token:', error);
    }
  };

  // Recuperar el token de sesión
  const getSessionToken = async (): Promise<Session | null> => {
    try {
      const sessionData = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (sessionData) {
        return JSON.parse(sessionData);
      }
      return null;
    } catch (error) {
      console.error('Error getting session token:', error);
      return null;
    }
  };

  // Eliminar el token de sesión
  const removeSessionToken = async () => {
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error removing session token:', error);
    }
  };

  // Guardar estado de onboarding
  const setHasSeenOnboarding = async (value: boolean) => {
    try {
      await SecureStore.setItemAsync(HAS_SEEN_ONBOARDING_KEY, String(value));
      setHasSeenOnboardingState(value);
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  };

  // Verificar si el usuario ha visto el onboarding
  const checkOnboardingStatus = async () => {
    try {
      const value = await SecureStore.getItemAsync(HAS_SEEN_ONBOARDING_KEY);
      setHasSeenOnboardingState(value === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  // Inicializar la autenticación
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        // Verificar estado de onboarding
        await checkOnboardingStatus();

        // Restaurar sesión desde el almacenamiento seguro
        const savedSession = await getSessionToken();
        
        if (savedSession) {
          // Verificar si la sesión es válida con Supabase
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session && !error) {
            setSession(session);
            setUser(session.user);
            // Actualizar el token almacenado con el más reciente
            await saveSessionToken(session);
          } else {
            // Si la sesión no es válida, limpiar el almacenamiento
            await removeSessionToken();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Escuchar cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session) {
          await saveSessionToken(session);
        } else {
          await removeSessionToken();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Métodos de autenticación
  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, username: string) => {
    const result = await supabase.auth.signUp({ 
      email, 
      password, 
      options: {
        data: { username }
      }
    });
    
    return result;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await removeSessionToken();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        hasSeenOnboarding,
        signIn,
        signUp,
        signOut,
        setHasSeenOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 