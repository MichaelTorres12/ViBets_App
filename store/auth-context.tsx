// store/auth-context.tsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/services/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

// Claves para almacenamiento seguro
const AUTH_TOKEN_KEY = 'auth-token';
const HAS_SEEN_ONBOARDING_KEY = 'has-seen-onboarding';

type AuthContextType = {
  // Estados
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasSeenOnboarding: boolean;

  // Métodos de autenticación
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;

  // Onboarding
  setHasSeenOnboarding: (value: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(false);

  // --------------------------------
  // Métodos para SecureStore
  // --------------------------------

  const saveSessionToken = useCallback(async (sessionObj: any) => {
    try {
      // Se guarda la sesión en SecureStore (si deseas guardar todo sessionObj)
      console.log('Saving Session => token:', sessionObj.access_token);
      
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, JSON.stringify(sessionObj));
    } catch (error) {
      console.error('Error saving session token:', error);
    }
  }, []);

  const getSessionToken = useCallback(async () => {
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
  }, []);

  const removeSessionToken = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error removing session token:', error);
    }
  }, []);

  // --------------------------------
  // Manejo de Onboarding
  // --------------------------------
  const checkOnboardingStatus = useCallback(async () => {
    try {
      const value = await SecureStore.getItemAsync(HAS_SEEN_ONBOARDING_KEY);
      setHasSeenOnboardingState(value === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  }, []);

  const setHasSeenOnboarding = useCallback(async (value: boolean) => {
    try {
      await SecureStore.setItemAsync(HAS_SEEN_ONBOARDING_KEY, String(value));
      setHasSeenOnboardingState(value);
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  }, []);

  // --------------------------------
  // Lógica para signUp, signIn, signOut, checkSession
  // (Adaptada de tu antigua auth-store, unida con la persistencia)
  // --------------------------------

  // Registrarse
  const signUp = useCallback(
    async (email: string, password: string, username?: string) => {
      setIsLoading(true);
      try {
        // 1) signUp en Supabase
        let { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } },
        });
        if (error) {
          console.error('Error en signUp:', error);
          throw error;
        }

        // 2) Si no hay session inmediata, forzamos signIn
        if (!data.session) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInError) {
            console.error('Error en signIn (post signUp):', signInError);
            throw signInError;
          }
          data = signInData;
        }

        // 3) Actualizamos estado interno
        setUser(data.user ?? null);
        setIsAuthenticated(!!data.user);

        // 4) Guardar la sesión en SecureStore (opcional: data.session)
        if (data.session) {
          await saveSessionToken(data.session);
        }

      } finally {
        setIsLoading(false);
      }
    },
    [saveSessionToken]
  );

  // Iniciar sesión
  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          console.error('Error en signIn:', error);
          throw error;
        }
        setUser(data.user ?? null);
        setIsAuthenticated(!!data.user);

        // Guardamos la session en SecureStore
        if (data.session) {
          await saveSessionToken(data.session);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [saveSessionToken]
  );

  // Cerrar sesión
  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      await removeSessionToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [removeSessionToken]);

  // Revisar si hay sesión activa
  const checkSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const newUser = data.session?.user ?? null;
      setUser(newUser);
      setIsAuthenticated(!!newUser);
      // En teoría, podrías re-guardar la session en SecureStore si lo deseas
      if (data.session) {
        await saveSessionToken(data.session);
      } else {
        await removeSessionToken();
      }
    } finally {
      setIsLoading(false);
    }
  }, [saveSessionToken, removeSessionToken]);

  // --------------------------------
  // initAuth: restaurar sesión + onboarding
  // --------------------------------
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        await checkOnboardingStatus();

        // 1) Ver si hay algo en SecureStore
        const savedSession = await getSessionToken();
        if (savedSession) {
          // 2) Verificamos con supabase si sigue válida
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session && !error) {
            setUser(session.user);
            setIsAuthenticated(true);
            // Re-guardar la session
            await saveSessionToken(session);
          } else {
            // No válida => limpiar
            await removeSessionToken();
            setUser(null);
            setIsAuthenticated(false);
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
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);

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
  }, [
    checkOnboardingStatus,
    getSessionToken,
    removeSessionToken,
    saveSessionToken,
  ]);

  // --------------------------------
  // Retornar el AuthContext
  // --------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        hasSeenOnboarding,
        signUp,
        signIn,
        signOut,
        checkSession,
        setHasSeenOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para consumir el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
