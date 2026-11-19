import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { domainApi } from '@/api/domain';
import { useAuth } from '@/context/auth';
import type { DoctorAssistant } from '@/types/domain';
import { errorMessage, roleName } from '@/utils/domain';

export default function AssistantsScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<DoctorAssistant[]>([]);
  const [assistantId, setAssistantId] = useState('');
  const [active, setActive] = useState(true);
  const [patientProfiles, setPatientProfiles] = useState(false);
  const [manageChambers, setManageChambers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try { setItems((await domainApi.doctorAssistants()).results); }
    catch (reason) { setMessage(errorMessage(reason, 'Unable to load assistants.')); }
    finally { setLoading(false); }
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (user && roleName(user.role) === 'doctor') void load(); }, [user?.id]);
  if (!user) return null;
  if (roleName(user.role) !== 'doctor') return <Redirect href="/(app)/(tabs)/profile" />;

  const authorize = async () => {
    setMessage('');
    const id = assistantId.trim();
    if (!id) { setMessage('Assistant ID is required.'); return; }
    if (items.some((item) => item.assistant_id === id)) { setMessage('This assistant is already authorized.'); return; }
    try {
      await domainApi.authorizeAssistant({ assistant_id: id, active, can_view_patient_profiles: patientProfiles, can_manage_chambers: manageChambers });
      setAssistantId('');
      await load();
      setMessage('Assistant authorized.');
    } catch (reason) { setMessage(errorMessage(reason, 'Unable to authorize assistant.')); }
  };
  const revoke = (item: DoctorAssistant) => Alert.alert(
    'Revoke assistant',
    `Remove ${item.assistant_name || item.assistant_email}?`,
    [{ text: 'Cancel', style: 'cancel' },
      { text: 'Revoke', style: 'destructive', onPress: () => {
        void domainApi.revokeAssistant(item.id).then(() => { setItems((current) => current.filter((value) => value.id !== item.id)); setMessage('Assistant revoked.'); })
          .catch((reason) => setMessage(errorMessage(reason, 'Unable to revoke assistant.')));
      } }],
  );

  return <View style={styles.container}>
    <Text style={styles.title}>Assistants</Text>
    <TextInput style={styles.input} value={assistantId} onChangeText={setAssistantId} placeholder="Assistant account ID" />
    <View style={styles.row}><Text>Active</Text><Switch value={active} onValueChange={setActive} /></View>
    <View style={styles.row}><Text>View patient profiles</Text><Switch value={patientProfiles} onValueChange={setPatientProfiles} /></View>
    <View style={styles.row}><Text>Manage chambers</Text><Switch value={manageChambers} onValueChange={setManageChambers} /></View>
    <Button title="Authorize assistant" onPress={() => void authorize()} />
    {!!message && <Text style={styles.message}>{message}</Text>}
    {loading ? <ActivityIndicator /> : <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text>No assistants are authorized.</Text>}
      renderItem={({ item }) => <View style={styles.card}>
        <Text style={styles.name}>{item.assistant_name || item.assistant_email}</Text>
        <Text>{item.active ? 'Active' : 'Inactive'}</Text>
        <Text>Patient profiles: {item.can_view_patient_profiles ? 'Allowed' : 'Denied'}</Text>
        <Text>Chambers: {item.can_manage_chambers ? 'Allowed' : 'Denied'}</Text>
        <Button title="Revoke" color="#b00020" onPress={() => revoke(item)} />
      </View>}
    />}
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  title: { fontSize: 24, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, marginBottom: 10, gap: 4 },
  name: { fontSize: 17, fontWeight: '700' },
  message: { color: '#1769aa' },
});
