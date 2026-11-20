import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { DoctorHospitalOption, DoctorSpecialization } from '@/types/domain';

export const SORT_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Name: A-Z', value: 'professional_name' },
  { label: 'Name: Z-A', value: '-professional_name' },
  { label: 'Experience: low to high', value: 'experience_years' },
  { label: 'Experience: high to low', value: '-experience_years' },
  { label: 'Fee: low to high', value: 'consultation_fee' },
  { label: 'Fee: high to low', value: '-consultation_fee' },
  { label: 'Newest', value: '-created_at' },
] as const;

type Props = {
  visible: boolean;
  onClose: () => void;
  specializations: DoctorSpecialization[];
  hospitals: DoctorHospitalOption[];
  optionsLoading: boolean;
  optionsError: string;
  onRetryOptions: () => void;
  selectedSpecializations: string[];
  selectedHospitals: string[];
  ordering: string;
  onSpecializationsChange: (values: string[]) => void;
  onHospitalsChange: (values: string[]) => void;
  onOrderingChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
};

export function DoctorFilterSheet(props: Props) {
  const theme = useTheme();
  const toggle = (values: string[], value: string) =>
    values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

  return (
    <Modal visible={props.visible} animationType="slide" transparent onRequestClose={props.onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Filters</Text>
            <Pressable onPress={props.onClose} accessibilityRole="button" accessibilityLabel="Close filters">
              <Text style={styles.primaryText}>Close</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            {props.optionsLoading ? (
              <View style={styles.optionState}>
                <ActivityIndicator />
                <Text style={{ color: theme.textSecondary }}>Loading filter options...</Text>
              </View>
            ) : null}
            {props.optionsError ? (
              <View style={styles.optionState}>
                <Text style={styles.error}>{props.optionsError}</Text>
                <Pressable onPress={props.onRetryOptions} accessibilityRole="button">
                  <Text style={styles.primaryText}>Retry</Text>
                </Pressable>
              </View>
            ) : null}

            <Text style={[styles.label, { color: theme.text }]}>Specializations</Text>
            <View style={styles.options}>
              {props.specializations.map((option) => {
                const selected = props.selectedSpecializations.includes(option.name);
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => props.onSpecializationsChange(toggle(props.selectedSpecializations, option.name))}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    style={[
                      styles.option,
                      { borderColor: theme.backgroundSelected },
                      selected && styles.selected,
                    ]}>
                    <Text style={{ color: selected ? '#1769aa' : theme.text }}>{option.name}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Hospitals</Text>
            <View style={styles.options}>
              {props.hospitals.map((option) => {
                const selected = props.selectedHospitals.includes(option.id);
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => props.onHospitalsChange(toggle(props.selectedHospitals, option.id))}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    style={[
                      styles.option,
                      { borderColor: theme.backgroundSelected },
                      selected && styles.selected,
                    ]}>
                    <Text style={{ color: selected ? '#1769aa' : theme.text }}>{option.name}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Sort</Text>
            <View style={styles.options}>
              {SORT_OPTIONS.map((option) => {
                const selected = props.ordering === option.value;
                return (
                  <Pressable
                    key={option.value || 'default'}
                    onPress={() => props.onOrderingChange(option.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    style={[
                      styles.option,
                      { borderColor: theme.backgroundSelected },
                      selected && styles.selected,
                    ]}>
                    <Text style={{ color: selected ? '#1769aa' : theme.text }}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
          <View style={[styles.actions, { borderTopColor: theme.backgroundSelected }]}>
            <Pressable
              onPress={props.onReset}
              accessibilityRole="button"
              style={[styles.button, { borderColor: theme.backgroundSelected }]}>
              <Text style={{ color: theme.text, fontWeight: '700' }}>Reset all</Text>
            </Pressable>
            <Pressable
              onPress={props.onApply}
              accessibilityRole="button"
              style={[styles.button, styles.apply]}>
              <Text style={styles.applyText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { maxHeight: '88%', borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
  },
  title: { fontSize: 20, fontWeight: '700' },
  primaryText: { color: '#1769aa', fontWeight: '700', padding: Spacing.two },
  content: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.three, gap: Spacing.two },
  optionState: { alignItems: 'center', gap: Spacing.one, paddingVertical: Spacing.two },
  error: { color: '#b00020', textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '700', marginTop: Spacing.two },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  option: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  selected: { borderColor: '#1769aa', backgroundColor: '#e8f0fa' },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  apply: { backgroundColor: '#1769aa', borderColor: '#1769aa' },
  applyText: { color: '#fff', fontWeight: '700' },
});
