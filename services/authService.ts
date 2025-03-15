// services/authService.ts
import { supabase } from './supabaseClient';

export async function signUp(email: string, password: string) {
  // Crea el usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // data.session contendrá la sesión del usuario (si todo va bien)
  return data.user;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  // data.session contendrá la sesión y data.user tendrá el usuario
  return data.user;
}
