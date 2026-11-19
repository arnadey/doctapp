import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { mediaUrl } from '@/config/api';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Doctor } from '@/types/domain';
import { formatFee, formatLanguages, normalizeSpecializationName } from '@/utils/domain';

type DoctorCardProps = {
  doctor: Doctor;
  onPress: (doctor: Doctor) => void;
};

export const DoctorCard = memo(function DoctorCard({ doctor, onPress }: DoctorCardProps) {
  const theme = useTheme();
  const rawImageUri = typeof doctor.profile_picture === 'string'
    ? mediaUrl(doctor.profile_picture)
    : null;
  const imageUri = rawImageUri && /^https?:\/\//i.test(rawImageUri) ? rawImageUri : null;
  const specialty = doctor.specialty || normalizeSpecializationName(doctor.specialization) || 'Specialty not listed';
  const hospitals = (doctor.hospitals ?? [])
    .map((hospital) => hospital.name)
    .filter(Boolean);
  const chambers = (doctor.chambers ?? [])
    .map((chamber) => typeof chamber.chamber_name === 'string' ? chamber.chamber_name : '')
    .filter(Boolean);

  return (
    <Pressable
      onPress={() => onPress(doctor)}
      accessibilityRole="button"
      accessibilityLabel={`View ${doctor.professional_name || 'doctor'}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
        pressed && styles.pressed,
      ]}>
      <Image
        source={imageUri ? { uri: imageUri } : require('@/assets/images/icon.png')}
        style={styles.image}
        contentFit="cover"
        transition={150}
      />
      <View style={styles.content}>
        <Text style={[styles.name, { color: theme.text }]}>
          {doctor.professional_name || 'Doctor name unavailable'}
        </Text>
        <Text style={[styles.specialty, { color: theme.textSecondary }]}>{specialty}</Text>
        <Text style={[styles.detail, { color: theme.text }]}>
          {typeof doctor.experience_years === 'number'
            ? `${doctor.experience_years} years experience`
            : 'Experience not listed'}
        </Text>
        <Text style={[styles.detail, { color: theme.text }]}>
          Fee: {formatFee(doctor.consultation_fee)}
        </Text>
        {doctor.qualifications ? (
          <Text style={[styles.detail, { color: theme.textSecondary }]}>
            {doctor.qualifications}
          </Text>
        ) : null}
        {hospitals.length > 0 ? (
          <Text style={[styles.detail, { color: theme.textSecondary }]}>
            {hospitals.join(', ')}
          </Text>
        ) : null}
        {chambers.length > 0 ? (
          <Text style={[styles.detail, { color: theme.textSecondary }]}>
            Chambers: {chambers.join(', ')}
          </Text>
        ) : null}
        {typeof doctor.languages !== 'undefined' ? (
          <Text style={[styles.detail, { color: theme.textSecondary }]}>
            Languages: {formatLanguages(doctor.languages)}
          </Text>
        ) : null}
        {doctor.verification_status ? (
          <Text style={[styles.status, { color: doctor.verification_status === 'APPROVED' ? '#20875f' : theme.textSecondary }]}>
            {doctor.verification_status}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.three,
  },
  pressed: { opacity: 0.75 },
  image: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.light.backgroundSelected,
  },
  content: { flex: 1, marginLeft: Spacing.three, gap: 3 },
  name: { fontSize: 18, fontWeight: '700' },
  specialty: { fontSize: 15, fontWeight: '600' },
  detail: { fontSize: 14, lineHeight: 20 },
  status: { fontSize: 12, fontWeight: '700', marginTop: 4 },
});
