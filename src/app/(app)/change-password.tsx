import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '@/api/client';

export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const submit = async () => { try { await api.changePassword({ old_password: oldPassword, new_password: newPassword }); setMessage('Password changed.'); setOldPassword(''); setNewPassword(''); } catch { setMessage('Unable to change password.'); } };
  return <View style={styles.container}><TextInput style={styles.input} secureTextEntry placeholder="Current password" value={oldPassword} onChangeText={setOldPassword} /><TextInput style={styles.input} secureTextEntry placeholder="New password" value={newPassword} onChangeText={setNewPassword} /><Button title="Change password" onPress={() => void submit()} disabled={!oldPassword || !newPassword} /><Text>{message}</Text></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 24, gap: 14 }, input: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, padding: 12 } });
