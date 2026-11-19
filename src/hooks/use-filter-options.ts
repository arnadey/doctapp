import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/types/auth';
import { domainApi, type FilterOptionsResponse } from '@/api/domain';
import type { DoctorHospitalOption, DoctorSpecialization } from '@/types/domain';

function normalizeSpecialization(value: unknown): DoctorSpecialization | null {
  if (typeof value === 'string' && value.trim()) return { id: value, name: value };
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const name = typeof record.name === 'string' ? record.name : '';
    const id = typeof record.id === 'string' ? record.id : name;
    if (name) return { id, name };
  }
  return null;
}

export function normalizeFilterOptions(payload: unknown): FilterOptionsResponse {
  const record = payload && typeof payload === 'object'
    ? payload as Record<string, unknown>
    : {};
  const rawSpecializations = Array.isArray(record.specializations)
    ? record.specializations
    : [];
  const rawHospitals = Array.isArray(record.hospitals)
    ? record.hospitals
    : [];

  const specializations = rawSpecializations
    .map(normalizeSpecialization)
    .filter((item): item is DoctorSpecialization => item !== null);

  const hospitals = rawHospitals.flatMap((value): DoctorHospitalOption[] => {
    if (!value || typeof value !== 'object') return [];
    const record = value as Record<string, unknown>;
    if (typeof record.id !== 'string' || typeof record.name !== 'string') return [];
    return [{
      id: record.id,
      name: record.name,
      address: typeof record.address === 'string' ? record.address : null,
    }];
  });

  return { specializations, hospitals };
}

export function useFilterOptions() {
  const [options, setOptions] = useState<FilterOptionsResponse>({
    specializations: [],
    hospitals: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let payload: unknown;
      try {
        payload = await domainApi.doctorFilterOptions();
      } catch (reason) {
        if (!(reason instanceof ApiError) || (reason.status !== 404 && reason.status !== 405)) throw reason;
        const [specialties, hospitals] = await Promise.all([
          domainApi.doctorSpecialties(),
          domainApi.doctorHospitals(),
        ]);
        payload = { specializations: specialties, hospitals };
      }
      setOptions(normalizeFilterOptions(payload));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load filter options.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  return { options, loading, error, reload: load };
}
