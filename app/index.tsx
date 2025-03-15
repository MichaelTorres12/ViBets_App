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
    // Puedes mostrar un spinner o un placeholder mientras se recupera la sesión.
    return null;
  }

  // Si hay sesión, se redirige a la app principal; si no, a login.
  return isAuthenticated ? <Redirect href="/(tabs)" /> : <Redirect href="/auth/login" />;
}
