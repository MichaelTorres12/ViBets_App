// app/index.tsx
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';

export default function Index() {
  const { isAuthenticated, checkSession } = useAuthStore();
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const init = async () => {
      await checkSession();
      setLoadingSession(false);
    };
    init();
  }, []);

  if (loadingSession) {
    // Spinner o algo similar mientras verificas sesión
    return null;
  }

  // Si hay sesión, vas a /tabs; si no, /auth/login
  return isAuthenticated ? <Redirect href="/(tabs)" /> : <Redirect href="/auth/login" />;
}
