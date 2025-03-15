// store/auth-store.ts

import { create } from 'zustand';
import { supabase } from '@/services/supabaseClient';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  loading: boolean;

  // Métodos
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  // Registro con username opcional (para user_metadata)
  signUp: async (email, password, username) => {
    set({ loading: true });
    
    let { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username, // si quieres almacenar en user_metadata
        },
      },
    });
    
    set({ loading: false });
    
    if (error) {
      console.error('Error en signUp:', error);
      throw error;
    }

    // Si no existe session, forzamos signIn
    if (!data.session) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        console.error('Error en signInWithPassword (post signUp):', signInError);
        throw signInError;
      }
      data = signInData;
    }

    // Actualizamos estado
    set({
      user: data.user,
      isAuthenticated: !!data.user,
      loading: false,
    });
  },

  // Inicio de sesión
  signIn: async (email, password) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    set({ loading: false });

    if (error) {
      console.error('Error en signIn:', error);
      throw error;
    }

    set({
      user: data.user,
      isAuthenticated: !!data.user,
    });
  },

  // Cierra sesión
  logout: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    } catch (err) {
      console.error('Error en logout:', err);
      set({ loading: false });
      throw err;
    }
  },

  // Verifica si hay sesión activa
  checkSession: async () => {
    set({ loading: true });
    const { data } = await supabase.auth.getSession();
    set({
      loading: false,
      user: data.session?.user ?? null,
      isAuthenticated: !!data.session?.user,
    });
  },
}));
