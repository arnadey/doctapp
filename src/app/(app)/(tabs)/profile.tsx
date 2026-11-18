import { Link } from 'expo-router';
import { Button, Image, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/context/auth';
import { mediaUrl } from '@/config/api';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  const profileImageUrl = mediaUrl(user.profile_image);
  return <View style={styles.container}>{profileImageUrl && <Image source={{ uri: profileImageUrl, cache: 'reload' }} style={styles.image} />}<Text style={styles.title}>{user.first_name} {user.last_name}</Text><Text>{user.email}</Text><Text>{user.phone_number || 'No phone number'}</Text><Text>Account: {user.account_status}</Text><Link href="/edit-profile" style={styles.link}>Edit profile</Link><Link href="/change-password" style={styles.link}>Change password</Link><Button title="Sign out" onPress={() => void signOut()} /></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 24, gap: 16 }, image: { width: 96, height: 96, borderRadius: 48, alignSelf: 'center' }, title: { fontSize: 28, fontWeight: '700', textAlign: 'center' }, link: { color: '#1769aa', paddingVertical: 8 } });
