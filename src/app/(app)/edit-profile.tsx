import { useState } from 'react';
import { Button, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/auth';
import { mediaUrl } from '@/config/api';

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastName, setLastName] = useState(user?.last_name ?? '');
  const [phone, setPhone] = useState(user?.phone_number ?? '');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
    if (!result.canceled) setImage(result.assets[0]);
  };
  const submit = async () => {
    try {
      const body = new FormData();
      body.append('first_name', firstName);
      body.append('last_name', lastName);
      body.append('phone_number', phone);
      if (image) body.append('profile_image', { uri: image.uri, name: image.fileName ?? 'profile.jpg', type: image.mimeType ?? 'image/jpeg' } as unknown as Blob);
      await updateUser(image ? body : { first_name: firstName, last_name: lastName, phone_number: phone });
      setMessage('Profile updated.');
    } catch { setMessage('Unable to update your profile.'); }
  };
  return <View style={styles.container}>{(image?.uri || mediaUrl(user?.profile_image ?? null)) && <Image source={{ uri: image?.uri || mediaUrl(user?.profile_image ?? null) as string }} style={styles.image} />}<Button title="Choose profile image" onPress={() => void pickImage()} /><TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name" /><TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last name" /><TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone number" /><Button title="Save changes" onPress={() => void submit()} /><Text>{message}</Text></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 24, gap: 14 }, input: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, padding: 12 }, image: { width: 96, height: 96, borderRadius: 48, alignSelf: 'center' } });
