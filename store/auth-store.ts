// store/auth-store.ts
import { create } from 'zustand';
import { supabase } from '@/services/supabaseClient';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  subscribeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  signUp: async (email, password, username) => {
    set({ loading: true });
    let { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    set({ loading: false });
    if (error) {
      console.error('Error en signUp:', error);
      throw error;
    }
    if (!data.session) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        console.error('Error en signInWithPassword (post signUp):', signInError);
        throw signInError;
      }
      data = signInData;
    }
    set({
      user: data.user,
      isAuthenticated: !!data.user,
      loading: false,
    });
  },

  signIn: async (email, password) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    set({ loading: false });
    if (error) {
      console.error('Error en signIn:', error);
      throw error;
    }
    set({ user: data.user, isAuthenticated: !!data.user });
  },

  logout: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  checkSession: async () => {
    set({ loading: true });
    const { data } = await supabase.auth.getSession();
    set({
      loading: false,
      user: data.session?.user ?? null,
      isAuthenticated: !!data.session?.user,
    });
  },

  // Suscripción para escuchar cambios en la sesión
  subscribeAuth: () => {
    supabase.auth.onAuthStateChange((event, session) => {
      set({
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
      });
    });
  },
}));
