import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, RefreshControl, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { domainApi } from '@/api/domain';
import type { Doctor } from '@/types/domain';
import { errorMessage, formatFee, formatLanguages } from '@/utils/domain';

export default function DoctorsScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  const [fee, setFee] = useState('');
  const [hospital, setHospital] = useState('');
  const [location, setLocation] = useState('');
  const [ordering, setOrdering] = useState('');
  const [page, setPage] = useState(1);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (requestedPage = 1, refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const result = await domainApi.doctors({
        search: search || undefined,
        specialty: specialty || undefined,
        experience_years: experience ? Number(experience) : undefined,
        consultation_fee: fee ? Number(fee) : undefined,
        hospital: hospital || undefined,
        location: location || undefined,
        ordering: ordering || undefined,
        page: requestedPage,
      });
      setDoctors((current) => requestedPage === 1 ? result.results : [...current, ...result.results]);
      setNext(result.next);
      setPage(requestedPage);
    } catch (reason) {
      setError(errorMessage(reason, 'Unable to load doctors.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, specialty, experience, fee, ordering]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(1); }, [load]);

  const applyFilters = () => void load(1);

  return <View style={styles.container}>
    <Text style={styles.title}>Find a doctor</Text>
    <TextInput
      style={styles.search}
      value={search}
      onChangeText={setSearch}
      onSubmitEditing={applyFilters}
      placeholder="Search doctors"
      returnKeyType="search"
      accessibilityLabel="Search doctors"
    />
    <View style={styles.filters}>
      <TextInput style={styles.filter} value={specialty} onChangeText={setSpecialty} placeholder="Specialty" />
      <TextInput style={styles.filter} value={experience} onChangeText={setExperience} placeholder="Experience" keyboardType="number-pad" />
      <TextInput style={styles.filter} value={fee} onChangeText={setFee} placeholder="Fee" keyboardType="decimal-pad" />
      <TextInput style={styles.filter} value={hospital} onChangeText={setHospital} placeholder="Hospital" />
      <TextInput style={styles.filter} value={location} onChangeText={setLocation} placeholder="Location" />
      <TextInput style={styles.filter} value={ordering} onChangeText={setOrdering} placeholder="Ordering" />
      <TouchableOpacity style={styles.apply} onPress={applyFilters} accessibilityRole="button"><Text style={styles.applyText}>Apply</Text></TouchableOpacity>
    </View>
    {!!error && <Text style={styles.error}>{error}</Text>}
    {loading && doctors.length === 0 ? <View style={styles.center}><ActivityIndicator /><Text>Loading doctors...</Text></View> :
      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(1, true)} />}
        onEndReached={() => { if (next && !loading) void load(page + 1); }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={<View style={styles.center}><Text>No doctors match these filters.</Text></View>}
        contentContainerStyle={doctors.length === 0 ? styles.emptyList : undefined}
        renderItem={({ item }) => <TouchableOpacity
          style={styles.card}
          onPress={() => router.push({ pathname: '/(app)/doctor/[id]' as never, params: { id: item.id } })}
          accessibilityRole="button"
          accessibilityLabel={`View ${item.professional_name}`}>
          <Text style={styles.name}>{item.professional_name}</Text>
          <Text>{item.specialty || 'Specialty not listed'} · {item.experience_years} years</Text>
          <Text>Fee: {formatFee(item.consultation_fee)}</Text>
          <Text>Languages: {formatLanguages(item.languages)}</Text>
        </TouchableOpacity>}
      />}
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
  search: { borderWidth: 1, borderColor: '#bbb', borderRadius: 10, padding: 12, marginBottom: 8 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  filter: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, minWidth: 110 },
  apply: { backgroundColor: '#1769aa', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  applyText: { color: 'white', fontWeight: '700' },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, marginBottom: 10, gap: 4 },
  name: { fontSize: 18, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyList: { flexGrow: 1 },
  error: { color: '#b00020', marginBottom: 8 },
});
