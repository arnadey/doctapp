import { Link } from 'expo-router';
import { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput } from 'react-native';

import { useAuth } from '@/context/auth';

export default function RegisterScreen() {
  const { signUp, error } = useAuth();
  const [values, setValues] = useState({ email: '', password: '', first_name: '', last_name: '', phone_number: '' });
  const update = (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const submit = () => signUp(values).catch(() => undefined);
  return <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Create your account</Text>
    {(['first_name', 'last_name', 'email', 'phone_number', 'password'] as const).map((key) =>
      <TextInput key={key} style={styles.input} placeholder={key.replace('_', ' ')} secureTextEntry={key === 'password'} autoCapitalize={key === 'email' ? 'none' : 'sentences'} value={values[key]} onChangeText={(value) => update(key, value)} />,
    )}
    {!!error && <Text style={styles.error}>{error}</Text>}
    <Button title="Register" onPress={submit} disabled={!values.email || !values.password || !values.first_name} />
    <Link href="/login" style={styles.link}>Already have an account? Sign in</Link>
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 14 },
  title: { fontSize: 28, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, padding: 12 },
  error: { color: '#b00020' },
  link: { color: '#1769aa', textAlign: 'center', padding: 6 },
});
