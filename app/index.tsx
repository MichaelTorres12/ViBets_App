// app/index.tsx
import { Redirect } from 'expo-router';
import { useAuth } from '@/store/auth-context'; // <-- Importas tu AuthContext

export default function Index() {
  // Leemos user, isLoading (o lo que desees) del AuthContext
  const { user, isLoading } = useAuth();

  // Mientras se inicializa la sesión (isLoading) mostramos null o un loader
  if (isLoading) {
    return null; // o un spinner
  }

  // Si hay un usuario logueado => redirigimos a (tabs)
  // Si no => a /auth/login
  return user
    ? <Redirect href="/(tabs)" />
    : <Redirect href="/auth/login" />;
}
