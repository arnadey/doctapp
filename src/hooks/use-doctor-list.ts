import { useCallback, useEffect, useRef, useState } from 'react';

import { domainApi, type DoctorFilters } from '@/api/domain';
import type { Doctor } from '@/types/domain';
import { errorMessage } from '@/utils/domain';

export function useDoctorList(filters: DoctorFilters) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (
    requestedPage: number,
    mode: 'replace' | 'append' | 'refresh',
  ) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (mode === 'replace') setLoading(true);
    if (mode === 'append') setLoadingMore(true);
    if (mode === 'refresh') setRefreshing(true);
    setError('');

    try {
      const result = await domainApi.doctors({
        ...filters,
        page: requestedPage,
        page_size: 20,
      }, controller.signal);
      if (controller.signal.aborted) return;

      setDoctors((current) => {
        const merged = mode === 'append' ? [...current, ...result.results] : result.results;
        const seen = new Set<string>();
        return merged.filter((doctor) => {
          if (seen.has(doctor.id)) return false;
          seen.add(doctor.id);
          return true;
        });
      });
      setCount(typeof result.count === 'number' ? result.count : result.results.length);
      setNext(result.next ?? null);
      setPage(requestedPage);
    } catch (reason) {
      if (controller.signal.aborted) return;
      setError(errorMessage(reason, 'Unable to load doctors.'));
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load(1, 'replace');
    }, 0);
    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [load]);

  const loadNext = useCallback(() => {
    if (next && !loading && !loadingMore) void load(page + 1, 'append');
  }, [load, loading, loadingMore, next, page]);

  const refresh = useCallback(() => {
    void load(1, 'refresh');
  }, [load]);

  const retry = useCallback(() => {
    void load(1, 'replace');
  }, [load]);

  return {
    doctors,
    count,
    next,
    loading,
    loadingMore,
    refreshing,
    error,
    loadNext,
    refresh,
    retry,
  };
}
