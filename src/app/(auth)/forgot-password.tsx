import { router } from 'expo-router';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { api } from '@/api/client';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const submit = async () => {
    try { await api.passwordReset({ email }); setMessage('If the email exists, reset instructions have been sent.'); }
    catch { setMessage('Unable to request a reset. Please try again.'); }
  };
  return <View style={styles.container}><Text style={styles.title}>Reset your password</Text><TextInput style={styles.input} placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} /><Button title="Send reset email" onPress={submit} disabled={!email} /><Text>{message}</Text><Button title="Back to sign in" onPress={() => router.replace('/login')} /></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: 24, gap: 14 }, title: { fontSize: 26, fontWeight: '700' }, input: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, padding: 12 } });
