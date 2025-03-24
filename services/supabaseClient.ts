// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://qwhdfelqbudpfjxzvikq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aGRmZWxxYnVkcGZqeHp2aWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5Njg5MDgsImV4cCI6MjA1NzU0NDkwOH0.FX02Hewl-bWL5LTlFBnr9kOobg-bvNvzoIwwYqykUDg';

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      storage: AsyncStorage,     // <--- así supabase persistirá la sesión en AsyncStorage
      autoRefreshToken: true,    // renueva el token si expira y hay refresh token
      persistSession: true,      // guarda la sesión en AsyncStorage
      detectSessionInUrl: false, // en React Native no hay URL
    },
  })