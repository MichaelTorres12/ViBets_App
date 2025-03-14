//app/index.tsx
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { View } from 'react-native';

export default function Index() {
  const { isAuthenticated } = useAuthStore();
  
  // Simple redirect based on authentication state
  // Wrap in a View to ensure we have a component rendering before navigation
  return (
    <View style={{ flex: 1 }}>
      {isAuthenticated ? <Redirect href="/(tabs)" /> : <Redirect href="/auth/login" />}
    </View>
  );
}