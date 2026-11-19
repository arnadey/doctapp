import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Modal, Pressable, RefreshControl, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { domainApi } from '@/api/domain';
import type { Doctor, DoctorHospitalOption } from '@/types/domain';
import { errorMessage, formatFee, formatLanguages } from '@/utils/domain';

export default function DoctorsScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  const [fee, setFee] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [location, setLocation] = useState('');
  const [ordering, setOrdering] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [hospitals, setHospitals] = useState<DoctorHospitalOption[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState('');
  const [page, setPage] = useState(1);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadOptions = useCallback(async (refresh = false) => {
    if (!refresh) setOptionsLoading(true);
    setOptionsError('');
    try {
      const [specialtyResult, hospitalResult] = await Promise.all([
        domainApi.doctorSpecialties(),
        domainApi.doctorHospitals(),
      ]);
      setSpecialties(specialtyResult);
      setHospitals(hospitalResult);
      setSpecialty((current) => specialtyResult.includes(current) ? current : '');
      setHospitalId((current) =>
        hospitalResult.some((hospital) => hospital.id === current) ? current : '',
      );
    } catch (reason) {
      setOptionsError(errorMessage(reason, 'Unable to load filter options.'));
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  const load = useCallback(async (requestedPage = 1, refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const result = await domainApi.doctors({
        search: search || undefined,
        specialty: specialty || undefined,
        experience_years: experience ? Number(experience) : undefined,
        consultation_fee: fee ? Number(fee) : undefined,
        hospital: hospitalId || undefined,
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
  }, [search, specialty, experience, fee, hospitalId, location, ordering]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadOptions();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadOptions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load(1);
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const clearAllFilters = () => {
    setSpecialty('');
    setExperience('');
    setFee('');
    setHospitalId('');
    setLocation('');
  };

  const refreshAll = () => {
    void loadOptions(true);
    void load(1, true);
  };

  const selectedHospital = hospitals.find((hospital) => hospital.id === hospitalId);
  const activeFilterCount = [
    specialty, experience, fee, hospitalId, location,
  ].filter(Boolean).length;

  return <View style={styles.container}>
    <Text style={styles.title}>Find a doctor</Text>
    <TextInput
      style={styles.search}
      value={search}
      onChangeText={setSearch}
      onSubmitEditing={() => void load(1)}
      placeholder="Search doctors"
      returnKeyType="search"
      accessibilityLabel="Search doctors"
    />
    <View style={styles.filterBar}>
      <Pressable
        style={styles.filterButton}
        onPress={() => setFilterVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`Open filters, ${activeFilterCount} active`}>
        <Text style={styles.filterButtonText}>Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}</Text>
      </Pressable>
      {!!activeFilterCount && <Pressable
        onPress={clearAllFilters}
        accessibilityRole="button"
        accessibilityLabel="Clear all filters">
        <Text style={styles.clearText}>Clear all</Text>
      </Pressable>}
    </View>
    {(specialty || selectedHospital || experience || fee || location) && <View style={styles.chips}>
      {specialty && <Text style={styles.chip}>Specialty: {specialty}</Text>}
      {selectedHospital && <Text style={styles.chip}>Hospital: {selectedHospital.name}</Text>}
      {!!experience && <Text style={styles.chip}>Experience: {experience}+ years</Text>}
      {!!fee && <Text style={styles.chip}>Fee: {fee}</Text>}
      {!!location && <Text style={styles.chip}>Location: {location}</Text>}
    </View>}
    {!!error && <Text style={styles.error}>{error}</Text>}
    {loading && doctors.length === 0 ? <View style={styles.center}><ActivityIndicator /><Text>Loading doctors...</Text></View> :
      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshAll} />}
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

    <Modal visible={filterVisible} animationType="slide" transparent onRequestClose={() => setFilterVisible(false)}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalPanel}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Doctor filters</Text>
            <Pressable onPress={() => setFilterVisible(false)} accessibilityRole="button" accessibilityLabel="Close filters">
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {optionsLoading && <View style={styles.optionLoading}><ActivityIndicator /><Text>Loading filter options...</Text></View>}
            {!!optionsError && <View style={styles.optionError}>
              <Text style={styles.error}>{optionsError}</Text>
              <Pressable onPress={() => void loadOptions()} accessibilityRole="button"><Text style={styles.retryText}>Retry</Text></Pressable>
            </View>}

            <Text style={styles.label}>Specialty</Text>
            <View style={styles.optionList}>
              <Pressable
                style={[styles.option, !specialty && styles.optionSelected]}
                onPress={() => setSpecialty('')}>
                <Text>All specialties</Text>
              </Pressable>
              {specialties.map((option) => <Pressable
                key={option}
                style={[styles.option, specialty === option && styles.optionSelected]}
                onPress={() => setSpecialty(option)}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${option}`}>
                <Text>{option}</Text>
              </Pressable>)}
            </View>

            <Text style={styles.label}>Hospital</Text>
            <View style={styles.optionList}>
              <Pressable
                style={[styles.option, !hospitalId && styles.optionSelected]}
                onPress={() => setHospitalId('')}>
                <Text>All hospitals</Text>
              </Pressable>
              {hospitals.map((option) => <Pressable
                key={option.id}
                style={[styles.option, hospitalId === option.id && styles.optionSelected]}
                onPress={() => setHospitalId(option.id)}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${option.name}`}>
                <Text>{option.name}</Text>
                <Text style={styles.optionAddress}>{option.address}</Text>
              </Pressable>)}
            </View>

            <Text style={styles.label}>Experience</Text>
            <TextInput style={styles.filterInput} value={experience} onChangeText={setExperience} placeholder="Minimum years" keyboardType="number-pad" />
            <Text style={styles.label}>Consultation fee</Text>
            <TextInput style={styles.filterInput} value={fee} onChangeText={setFee} placeholder="Maximum fee" keyboardType="decimal-pad" />
            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.filterInput} value={location} onChangeText={setLocation} placeholder="City or location" />
            <Text style={styles.label}>Ordering</Text>
            <TextInput style={styles.filterInput} value={ordering} onChangeText={setOrdering} placeholder="e.g. -consultation_fee" />
          </ScrollView>
          <View style={styles.modalActions}>
            <Pressable style={styles.clearButton} onPress={clearAllFilters} accessibilityRole="button"><Text>Clear all</Text></Pressable>
            <Pressable
              style={styles.apply}
              onPress={() => { setFilterVisible(false); void load(1); }}
              accessibilityRole="button">
              <Text style={styles.applyText}>Apply filters</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
  search: { borderWidth: 1, borderColor: '#bbb', borderRadius: 10, padding: 12, marginBottom: 8 },
  filterBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  filterButton: { backgroundColor: '#1769aa', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  filterButtonText: { color: 'white', fontWeight: '700' },
  clearText: { color: '#1769aa', fontWeight: '700', padding: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: { backgroundColor: '#e8f0fa', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, marginBottom: 10, gap: 4 },
  name: { fontSize: 18, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyList: { flexGrow: 1 },
  error: { color: '#b00020', marginBottom: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalPanel: { maxHeight: '88%', backgroundColor: 'white', borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  closeText: { color: '#1769aa', fontWeight: '700', padding: 8 },
  modalContent: { padding: 16, gap: 8 },
  optionLoading: { alignItems: 'center', gap: 6, marginBottom: 8 },
  optionError: { marginBottom: 8 },
  retryText: { color: '#1769aa', fontWeight: '700' },
  label: { fontWeight: '700', marginTop: 8 },
  optionList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, maxWidth: '100%' },
  optionSelected: { borderColor: '#1769aa', backgroundColor: '#e8f0fa' },
  optionAddress: { color: '#666', fontSize: 12 },
  filterInput: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, padding: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderTopWidth: 1, borderTopColor: '#eee', gap: 10 },
  clearButton: { borderWidth: 1, borderColor: '#bbb', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 12 },
  apply: { backgroundColor: '#1769aa', borderRadius: 8, paddingHorizontal: 18, justifyContent: 'center' },
  applyText: { color: 'white', fontWeight: '700' },
});
