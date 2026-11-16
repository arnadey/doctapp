import { Redirect } from 'expo-router';

import { useAuth } from '@/context/auth';

export default function EntryScreen() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Redirect href={user ? '/(app)' : '/(auth)/login'} />;
}
