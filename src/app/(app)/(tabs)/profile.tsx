import { Link } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/context/auth';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  return <View style={styles.container}><Text style={styles.title}>{user.first_name} {user.last_name}</Text><Text>{user.email}</Text><Text>{user.phone_number || 'No phone number'}</Text><Text>Account: {user.account_status}</Text><Link href="/edit-profile" style={styles.link}>Edit profile</Link><Link href="/change-password" style={styles.link}>Change password</Link><Button title="Sign out" onPress={() => void signOut()} /></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 24, gap: 16 }, title: { fontSize: 28, fontWeight: '700' }, link: { color: '#1769aa', paddingVertical: 8 } });
