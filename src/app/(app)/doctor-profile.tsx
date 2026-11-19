import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { domainApi } from '@/api/domain';
import { mediaUrl } from '@/config/api';
import { useAuth } from '@/context/auth';
import type { Doctor } from '@/types/domain';
import { errorMessage, roleName } from '@/utils/domain';

export default function DoctorProfileScreen() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [professionalName, setProfessionalName] = useState('');
  const [bio, setBio] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [experience, setExperience] = useState('');
  const [registration, setRegistration] = useState('');
  const [fee, setFee] = useState('');
  const [languages, setLanguages] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || roleName(user.role) !== 'doctor') return;
    domainApi.doctorMe().then((value) => {
      setDoctor(value); setProfessionalName(value.professional_name); setBio(value.bio);
      setSpecialty(value.specialty); setQualifications(value.qualifications);
      setExperience(String(value.experience_years ?? '')); setFee(value.consultation_fee);
      setLanguages(Array.isArray(value.languages) ? value.languages.join(', ') : typeof value.languages === 'string' ? value.languages : '');
    }).catch((reason) => setMessage(errorMessage(reason, 'Unable to load doctor profile.')))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (!user) return null;
  if (roleName(user.role) !== 'doctor') return <Redirect href="/(app)/(tabs)/profile" />;
  if (loading) return <View style={styles.center}><ActivityIndicator /><Text>Loading doctor profile...</Text></View>;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
    if (!result.canceled) setImage(result.assets[0]);
  };
  const submit = async () => {
    setMessage('');
    if (!professionalName.trim() || !specialty.trim() || !registration.trim()) {
      setMessage('Professional name, specialty, and registration number are required.');
      return;
    }
    setSaving(true);
    try {
      const body = new FormData();
      body.append('professional_name', professionalName);
      body.append('bio', bio);
      body.append('specialty', specialty);
      body.append('qualifications', qualifications);
      if (experience) body.append('experience_years', experience);
      body.append('medical_registration_number', registration);
      if (fee) body.append('consultation_fee', fee);
      body.append('languages', languages);
      if (image) body.append('profile_picture', new File(image.uri) as unknown as Blob);
      await domainApi.updateDoctorMe(body);
      setMessage('Doctor profile updated.');
    } catch (reason) {
      setMessage(errorMessage(reason, 'Unable to update doctor profile.'));
    } finally {
      setSaving(false);
    }
  };

  const picture = image?.uri || mediaUrl(doctor?.profile_picture ?? null);
  return <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.status}>Verification status: {user.account_status === 'active' ? 'Approved' : user.account_status}</Text>
    {picture && <Image source={{ uri: picture }} style={styles.image} />}
    <Button title="Choose profile picture" onPress={() => void pickImage()} disabled={saving} />
    <TextInput style={styles.input} value={professionalName} onChangeText={setProfessionalName} placeholder="Professional name" />
    <TextInput style={[styles.input, styles.multiline]} value={bio} onChangeText={setBio} placeholder="Bio" multiline />
    <TextInput style={styles.input} value={specialty} onChangeText={setSpecialty} placeholder="Specialty" />
    <TextInput style={[styles.input, styles.multiline]} value={qualifications} onChangeText={setQualifications} placeholder="Qualifications" multiline />
    <TextInput style={styles.input} value={experience} onChangeText={setExperience} placeholder="Experience years" keyboardType="number-pad" />
    <TextInput style={styles.input} value={registration} onChangeText={setRegistration} placeholder="Medical registration/license number" />
    <TextInput style={styles.input} value={fee} onChangeText={setFee} placeholder="Consultation fee" keyboardType="decimal-pad" />
    <TextInput style={styles.input} value={languages} onChangeText={setLanguages} placeholder="Languages (comma separated)" />
    {!!message && <Text style={message.includes('updated') ? styles.success : styles.error}>{message}</Text>}
    <Button title={saving ? 'Saving...' : 'Save changes'} onPress={() => void submit()} disabled={saving} />
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  input: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, padding: 12 },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  image: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center' },
  status: { textAlign: 'center', color: '#1769aa', fontWeight: '700' },
  error: { color: '#b00020' },
  success: { color: '#176b3a' },
});
