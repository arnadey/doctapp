import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { domainApi } from '@/api/domain';
import type { Hospital } from '@/types/domain';
import { errorMessage } from '@/utils/domain';

export default function HospitalsScreen() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const page = await domainApi.hospitals({ search: search || undefined, active: 'true' });
      setHospitals(page.results);
    } catch (reason) { setError(errorMessage(reason, 'Unable to load hospitals.')); }
    finally { setLoading(false); setRefreshing(false); }
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, []);
  return <View style={styles.container}>
    <Text style={styles.title}>Hospitals</Text>
    <View style={styles.filters}>
      <TextInput style={styles.input} value={search} onChangeText={setSearch} placeholder="Hospital search" onSubmitEditing={() => void load()} />
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Location" />
    </View>
    {!!error && <Text style={styles.error}>{error}</Text>}
    {loading ? <View style={styles.center}><ActivityIndicator /><Text>Loading hospitals...</Text></View> : <FlatList
      data={hospitals}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
      ListEmptyComponent={<Text>No hospitals found.</Text>}
      renderItem={({ item }) => <View style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>
        <Text>{item.address}</Text>
        {!!item.contact_number && <Text>{item.contact_number}</Text>}
        {!!item.latitude && !!item.longitude && <Text>{item.latitude}, {item.longitude}</Text>}
      </View>}
    />}
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  filters: { gap: 8, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, padding: 12 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, marginBottom: 10, gap: 4 },
  name: { fontSize: 17, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  error: { color: '#b00020' },
});
