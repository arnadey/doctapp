import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/context/auth';

export default function AppLayout() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;
  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="edit-profile" options={{ headerShown: true, title: 'Edit profile' }} />
    <Stack.Screen name="change-password" options={{ headerShown: true, title: 'Change password' }} />
  </Stack>;
}
