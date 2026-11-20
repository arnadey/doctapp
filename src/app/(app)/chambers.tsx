import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { domainApi } from '@/api/domain';
import { useAuth } from '@/context/auth';
import type { Chamber } from '@/types/domain';
import { errorMessage, roleName } from '@/utils/domain';

export default function ChambersScreen() {
  const { user } = useAuth();
  const role = user ? roleName(user.role) : '';
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [fee, setFee] = useState('');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const chamberPage = await domainApi.chambers({ active: true });
      setChambers(chamberPage.results);
    } catch (reason) { setMessage(errorMessage(reason, 'Unable to load chambers.')); }
    finally { setLoading(false); }
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (user) void load(); }, [user?.id]);
  if (!user) return null;
  if (role !== 'doctor' && role !== 'assistant') return <Redirect href="/(app)/(tabs)/profile" />;

  const create = async () => {
    setMessage('');
    if (!name.trim() || !address.trim()) { setMessage('Chamber name and address are required.'); return; }
    try {
      await domainApi.createChamber({
        chamber_name: name, address, hospital: hospitalId || null,
        consultation_fee_override: fee || null, active,
      });
      setName(''); setAddress(''); setHospitalId(''); setFee('');
      await load();
      setMessage('Chamber saved.');
    } catch (reason) { setMessage(errorMessage(reason, 'Unable to save chamber.')); }
  };
  const remove = (item: Chamber) => Alert.alert('Delete chamber', `Delete ${item.chamber_name}?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => {
      void domainApi.deleteChamber(item.id).then(() => { setChambers((current) => current.filter((value) => value.id !== item.id)); setMessage('Chamber deleted.'); })
        .catch((reason) => setMessage(errorMessage(reason, 'Unable to delete chamber.')));
    } },
  ]);

  return <View style={styles.container}>
    <Text style={styles.title}>Chambers</Text>
    {role === 'doctor' ? <>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Chamber name" />
      <TextInput style={[styles.input, styles.multiline]} value={address} onChangeText={setAddress} placeholder="Address" multiline />
      <TextInput style={styles.input} value={hospitalId} onChangeText={setHospitalId} placeholder="Hospital ID (optional)" />
      <TextInput style={styles.input} value={fee} onChangeText={setFee} placeholder="Fee override" keyboardType="decimal-pad" />
      <View style={styles.row}><Text>Active</Text><Switch value={active} onValueChange={setActive} /></View>
      <Button title="Create chamber" onPress={() => void create()} />
    </> : <Text>Assistants can manage chambers only when their relationship permits it.</Text>}
    {!!message && <Text style={styles.message}>{message}</Text>}
    {loading ? <ActivityIndicator /> : <FlatList
      data={chambers}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text>No chambers found.</Text>}
      renderItem={({ item }) => <View style={styles.card}>
        <Text style={styles.name}>{item.chamber_name}</Text>
        <Text>{item.address}</Text>
        <Text>Fee: {item.consultation_fee_override ?? 'Doctor standard fee'}</Text>
        {role === 'doctor' && <Button title="Delete" color="#b00020" onPress={() => remove(item)} />}
      </View>}
    />}
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  title: { fontSize: 24, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, padding: 12 },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, marginBottom: 10, gap: 4 },
  name: { fontSize: 17, fontWeight: '700' },
  message: { color: '#1769aa' },
});
