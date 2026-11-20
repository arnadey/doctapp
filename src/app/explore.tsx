import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DoctorCard } from '@/components/doctor-card';
import { DoctorFilterSheet } from '@/components/doctor-filter-sheet';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useDoctorList } from '@/hooks/use-doctor-list';
import { useFilterOptions } from '@/hooks/use-filter-options';
import { useTheme } from '@/hooks/use-theme';
import type { Doctor } from '@/types/domain';

export default function DoctorsScreen() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [draftSpecializations, setDraftSpecializations] = useState<string[]>([]);
  const [draftHospitals, setDraftHospitals] = useState<string[]>([]);
  const [draftOrdering, setDraftOrdering] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [hospitals, setHospitals] = useState<string[]>([]);
  const [ordering, setOrdering] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const filterOptions = useFilterOptions();

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchDraft), 400);
    return () => clearTimeout(timer);
  }, [searchDraft]);

  const doctorFilters = useMemo(() => ({
    search: search || undefined,
    specialization: specializations,
    hospital: hospitals,
    ordering: ordering || undefined,
  }), [hospitals, ordering, search, specializations]);

  const list = useDoctorList(doctorFilters);
  const activeFilterCount =
    (search ? 1 : 0) +
    specializations.length +
    hospitals.length +
    (ordering ? 1 : 0);

  const openFilters = () => {
    setDraftSpecializations(specializations);
    setDraftHospitals(hospitals);
    setDraftOrdering(ordering);
    setFilterVisible(true);
  };

  const applyFilters = () => {
    setSpecializations(draftSpecializations);
    setHospitals(draftHospitals);
    setOrdering(draftOrdering);
    setFilterVisible(false);
  };

  const resetAll = () => {
    setSearchDraft('');
    setSearch('');
    setDraftSpecializations([]);
    setDraftHospitals([]);
    setDraftOrdering('');
    setSpecializations([]);
    setHospitals([]);
    setOrdering('');
  };

  const openDoctor = (doctor: Doctor) => {
    router.push({
      pathname: '/(app)/doctor/[id]' as never,
      params: { id: doctor.id },
    });
  };

  const contentBottom = Math.max(safeAreaInsets.bottom, 16) + BottomTabInset;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[
        styles.header,
        {
          paddingTop: safeAreaInsets.top + Spacing.two,
          paddingLeft: safeAreaInsets.left + Spacing.three,
          paddingRight: safeAreaInsets.right + Spacing.three,
        },
      ]}>
        <Text style={[styles.title, { color: theme.text }]}>Find a doctor</Text>
        <View style={styles.searchRow}>
          <TextInput
            value={searchDraft}
            onChangeText={setSearchDraft}
            placeholder="Search doctors"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.search,
              {
                color: theme.text,
                backgroundColor: theme.backgroundElement,
                borderColor: theme.backgroundSelected,
              },
            ]}
            accessibilityLabel="Search doctors"
            returnKeyType="search"
          />
          <Pressable
            onPress={openFilters}
            accessibilityRole="button"
            accessibilityLabel={`Open filters, ${activeFilterCount} active`}
            style={styles.filterButton}>
            <Text style={styles.filterText}>Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}</Text>
          </Pressable>
        </View>
      </View>

      {list.loading && list.doctors.length === 0 ? (
        <View style={styles.center}>
          <View style={[styles.skeleton, { backgroundColor: theme.backgroundElement }]} />
          <View style={[styles.skeleton, styles.skeletonShort, { backgroundColor: theme.backgroundElement }]} />
          <ActivityIndicator style={{ marginTop: Spacing.three }} />
          <Text style={{ color: theme.textSecondary }}>Loading doctors...</Text>
        </View>
      ) : list.error && list.doctors.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.stateText, { color: theme.text }]}>Unable to load doctors</Text>
          <Text style={[styles.errorDetail, { color: theme.textSecondary }]}>{list.error}</Text>
          <Pressable onPress={list.retry} accessibilityRole="button" style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={list.doctors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DoctorCard doctor={item} onPress={openDoctor} />}
          refreshControl={
            <RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} />
          }
          onEndReached={list.loadNext}
          onEndReachedThreshold={0.35}
          contentContainerStyle={[
            styles.listContent,
            list.doctors.length === 0 && styles.emptyList,
            { paddingBottom: contentBottom },
          ]}
          ListEmptyComponent={
            !list.loading ? (
              <View style={styles.center}>
                <Text style={[styles.stateText, { color: theme.text }]}>No doctors found</Text>
                <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
                  Try a different search or clear your filters.
                </Text>
              </View>
            ) : undefined
          }
          ListFooterComponent={
            list.loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator />
              </View>
            ) : undefined
          }
        />
      )}

      <DoctorFilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        specializations={filterOptions.options.specializations}
        hospitals={filterOptions.options.hospitals}
        optionsLoading={filterOptions.loading}
        optionsError={filterOptions.error}
        onRetryOptions={filterOptions.reload}
        selectedSpecializations={draftSpecializations}
        selectedHospitals={draftHospitals}
        ordering={draftOrdering}
        onSpecializationsChange={setDraftSpecializations}
        onHospitalsChange={setDraftHospitals}
        onOrderingChange={setDraftOrdering}
        onApply={applyFilters}
        onReset={resetAll}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: Spacing.two },
  title: { fontSize: 28, fontWeight: '700', marginBottom: Spacing.two },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  search: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 48,
    paddingHorizontal: Spacing.three,
  },
  filterButton: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#1769aa',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  filterText: { color: '#fff', fontWeight: '700' },
  listContent: { flexGrow: 0 },
  emptyList: { flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four, gap: Spacing.two },
  stateText: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  errorDetail: { textAlign: 'center' },
  retryButton: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#1769aa',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  footer: { alignItems: 'center', paddingVertical: Spacing.three },
  skeleton: { width: '90%', height: 96, borderRadius: Spacing.three },
  skeletonShort: { width: '70%', height: 40, marginTop: Spacing.two },
});
