import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { api } from '@/api/client';

export default function ResetPasswordScreen() {
  const { uid = '', token = '' } = useLocalSearchParams<{ uid?: string; token?: string }>();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const submit = async () => { try { await api.passwordResetConfirm({ uid: String(uid), token: String(token), new_password: password }); router.replace('/login'); } catch { setMessage('The reset link is invalid or expired.'); } };
  return <View style={styles.container}><Text style={styles.title}>Choose a new password</Text><TextInput style={styles.input} secureTextEntry placeholder="New password" value={password} onChangeText={setPassword} /><Button title="Update password" onPress={submit} disabled={!password || !uid || !token} /><Text>{message}</Text></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: 24, gap: 14 }, title: { fontSize: 26, fontWeight: '700' }, input: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, padding: 12 } });
