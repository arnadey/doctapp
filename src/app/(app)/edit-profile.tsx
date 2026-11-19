import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import DateTimePicker, { DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';

import { domainApi } from '@/api/domain';
import { mediaUrl } from '@/config/api';
import { useAuth } from '@/context/auth';
import type { PatientProfile } from '@/types/domain';
import { errorMessage, roleName } from '@/utils/domain';

export default function EditProfileScreen() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const parsedBirthDate = dateOfBirth
    ? new Date(`${dateOfBirth}T12:00:00`)
    : new Date(2000, 0, 1);

  const onBirthDateChange = (_event: DateTimePickerChangeEvent, selectedDate: Date) => {
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    if (!selectedDate) return;
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    setDateOfBirth(`${year}-${month}-${day}`);
  };

  useEffect(() => {
    if (!user || roleName(user.role) !== 'patient') return;
    domainApi.patientMe().then((value) => {
      setProfile(value);
      setDateOfBirth(value.date_of_birth ?? '');
      setGender(value.gender ?? '');
      setAddress(value.address ?? '');
      setEmergencyName(value.emergency_contact_name ?? '');
      setEmergencyPhone(value.emergency_contact_phone ?? '');
    }).catch((reason) => setMessage(errorMessage(reason, 'Unable to load your profile.')))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (!user) return null;
  if (roleName(user.role) !== 'patient') return <Redirect href="/(app)/(tabs)/profile" />;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const submit = async () => {
    setMessage('');
    if (emergencyPhone && emergencyPhone.replace(/\D/g, '').length < 7) {
      setMessage('Enter a valid emergency contact phone.');
      return;
    }
    setSaving(true);
    try {
      const body = new FormData();
      body.append('date_of_birth', dateOfBirth);
      body.append('gender', gender);
      body.append('address', address);
      body.append('emergency_contact_name', emergencyName);
      body.append('emergency_contact_phone', emergencyPhone);
      if (image) body.append('profile_picture', new File(image.uri) as unknown as Blob);
      await domainApi.updatePatientMe(body);
      await refreshUser();
      setMessage('Profile updated.');
    } catch (reason) {
      setMessage(errorMessage(reason, 'Unable to update your profile.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator /><Text>Loading profile...</Text></View>;
  const picture = image?.uri || mediaUrl(profile?.profile_picture ?? null);
  return <ScrollView contentContainerStyle={styles.container}>
    {picture && <Image source={{ uri: picture }} style={styles.image} />}
    <Button title="Choose profile picture" onPress={() => void pickImage()} disabled={saving} />
    <Pressable
      style={styles.dateButton}
      onPress={() => setShowDatePicker(true)}
      accessibilityRole="button"
      accessibilityLabel="Choose date of birth">
      <Text style={dateOfBirth ? styles.dateText : styles.datePlaceholder}>
        {dateOfBirth || 'Choose date of birth'}
      </Text>
    </Pressable>
    {showDatePicker && <DateTimePicker
      value={Number.isNaN(parsedBirthDate.getTime()) ? new Date(2000, 0, 1) : parsedBirthDate}
      mode="date"
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      maximumDate={new Date()}
      onValueChange={onBirthDateChange}
      onDismiss={() => setShowDatePicker(false)}
    />}
    <TextInput style={styles.input} value={gender} onChangeText={setGender} placeholder="Gender" />
    <TextInput style={[styles.input, styles.multiline]} value={address} onChangeText={setAddress} placeholder="Address" multiline />
    <TextInput style={styles.input} value={emergencyName} onChangeText={setEmergencyName} placeholder="Emergency contact name" />
    <TextInput style={styles.input} value={emergencyPhone} onChangeText={setEmergencyPhone} placeholder="Emergency contact phone" keyboardType="phone-pad" />
    {!!message && <Text style={message === 'Profile updated.' ? styles.success : styles.error}>{message}</Text>}
    <Button title={saving ? 'Saving...' : 'Save changes'} onPress={() => void submit()} disabled={saving} />
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  input: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, padding: 12 },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  image: { width: 96, height: 96, borderRadius: 48, alignSelf: 'center' },
  dateButton: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, padding: 12, minHeight: 48, justifyContent: 'center' },
  dateText: { color: '#111' },
  datePlaceholder: { color: '#777' },
  error: { color: '#b00020' },
  success: { color: '#176b3a' },
});
