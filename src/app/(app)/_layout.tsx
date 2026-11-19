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
    <Stack.Screen name="doctor-profile" options={{ headerShown: true, title: 'Doctor profile' }} />
    <Stack.Screen name="assistants" options={{ headerShown: true, title: 'Assistants' }} />
    <Stack.Screen name="chambers" options={{ headerShown: true, title: 'Chambers' }} />
    <Stack.Screen name="hospitals" options={{ headerShown: true, title: 'Hospitals' }} />
    <Stack.Screen name="associated-doctors" options={{ headerShown: true, title: 'Associated doctors' }} />
    <Stack.Screen name="doctor" options={{ headerShown: false }} />
  </Stack>;
}
