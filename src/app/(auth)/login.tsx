import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/context/auth';

export default function LoginScreen() {
  const { signIn, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async () => {
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch {
      // signIn stores the user-facing message in auth context.
    } finally {
      setSubmitting(false);
    }
  };
  return <View style={styles.container}>
    <Text style={styles.title}>Sign in to DocTapp</Text>
    <TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
    <TextInput secureTextEntry placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} />
    {!!error && <Text style={styles.error}>{error}</Text>}
    {submitting || loading ? <ActivityIndicator /> : <Button title="Sign in" onPress={submit} disabled={!email || !password} />}
    <Link href="/forgot-password" style={styles.link}>Forgot password?</Link>
    <Link href="/register" style={styles.link}>Create an account</Link>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 14 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, padding: 12 },
  error: { color: '#b00020' },
  link: { color: '#1769aa', textAlign: 'center', padding: 6 },
});
