import { useLocalSearchParams, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { domainApi } from '@/api/domain';
import { mediaUrl } from '@/config/api';
import type { Doctor } from '@/types/domain';
import { errorMessage, formatDate, formatFee, formatLanguages } from '@/utils/domain';

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!id) return;
    domainApi.doctor(id).then(setDoctor).catch((reason) => setError(errorMessage(reason, 'Unable to load doctor.'))).finally(() => setLoading(false));
  }, [id]);
  if (loading) return <View style={styles.center}><ActivityIndicator /><Text>Loading doctor...</Text></View>;
  return <><Stack.Screen options={{ title: doctor?.professional_name ?? 'Doctor' }} /><ScrollView contentContainerStyle={styles.container}>
    {!!error && <Text style={styles.error}>{error}</Text>}
    {doctor && <>
      {doctor.profile_picture && <Image source={{ uri: mediaUrl(doctor.profile_picture) ?? '' }} style={styles.image} />}
      <Text style={styles.title}>{doctor.professional_name}</Text>
      <Text style={styles.specialty}>{doctor.specialty}</Text>
      <Text>{doctor.bio || 'No biography provided.'}</Text>
      <Text>Qualifications: {doctor.qualifications || 'Not listed'}</Text>
      <Text>Experience: {doctor.experience_years} years</Text>
      <Text>Consultation fee: {formatFee(doctor.consultation_fee)}</Text>
      <Text>Languages: {formatLanguages(doctor.languages)}</Text>
      <Text>Updated: {formatDate(doctor.updated_at)}</Text>
    </>}
  </ScrollView></>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  image: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center' },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  specialty: { textAlign: 'center', color: '#1769aa', fontWeight: '700' },
  error: { color: '#b00020' },
});
