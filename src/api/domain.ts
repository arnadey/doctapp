import { request } from '@/api/client';
import type {
  Chamber, Doctor, DoctorAssistant, DoctorAssistantCreate,
  DoctorFilterOptions, DoctorHospitalOption, DoctorSpecialtyOption, Hospital, Paginated, PatientProfile,
} from '@/types/domain';

export type FilterOptionsResponse = DoctorFilterOptions;

export type DoctorFilters = {
  search?: string;
  specialty?: string;
  specialization?: string[];
  experience_years?: number;
  consultation_fee?: number;
  hospital?: string[];
  location?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
};

export const domainApi = {
  patientMe: () => request<PatientProfile>('/patients/me/'),
  updatePatientMe: (body: Record<string, unknown> | FormData) =>
    request<PatientProfile>('/patients/me/', { method: 'PATCH', body }),
  doctors: (filters: DoctorFilters = {}, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.specialization?.length) {
      params.set('specialization', filters.specialization.join(','));
    } else if (filters.specialty) {
      params.set('specialization', filters.specialty);
    }
    if (filters.hospital?.length) params.set('hospital', filters.hospital.join(','));
    if (filters.location) params.set('location', filters.location);
    if (filters.ordering) params.set('ordering', filters.ordering);
    if (filters.experience_years !== undefined) params.set('experience_years', String(filters.experience_years));
    if (filters.consultation_fee !== undefined) params.set('consultation_fee', String(filters.consultation_fee));
    if (filters.page) params.set('page', String(filters.page));
    if (filters.page_size) params.set('page_size', String(filters.page_size));
    const query = params.toString();
    return request<Paginated<Doctor>>(`/doctors/${query ? `?${query}` : ''}`, {
      skipAuth: true,
      signal,
    });
  },
  doctor: (id: string) => request<Doctor>(`/doctors/${id}/`, { skipAuth: true }),
  doctorMe: () => request<Doctor>('/doctors/me/'),
  doctorFilterOptions: () =>
    request<import('@/types/domain').DoctorFilterOptions>('/doctors/filter-options/', { skipAuth: true }),
  doctorSpecialties: () =>
    request<DoctorSpecialtyOption[]>('/doctors/specialties/', { skipAuth: true }),
  doctorHospitals: () =>
    request<DoctorHospitalOption[]>('/doctors/hospitals/', { skipAuth: true }),
  updateDoctorMe: (body: Record<string, unknown> | FormData) =>
    request<import('@/types/domain').DoctorWrite>('/doctors/me/', { method: 'PATCH', body }),
  assistantDoctors: () => request<Paginated<Doctor>>('/assistants/me/doctors/'),
  doctorAssistants: () => request<Paginated<DoctorAssistant>>('/doctors/me/assistants/'),
  authorizeAssistant: (body: DoctorAssistantCreate) =>
    request<DoctorAssistant>('/doctors/me/assistants/', { method: 'POST', body }),
  updateAssistant: (id: string, body: Partial<DoctorAssistantCreate>) =>
    request<DoctorAssistant>(`/doctors/me/assistants/${id}/`, { method: 'PATCH', body }),
  revokeAssistant: (id: string) =>
    request<void>(`/doctors/me/assistants/${id}/`, { method: 'DELETE' }),
  hospitals: (params: Record<string, string | number | undefined> = {}) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') search.set(key, String(value));
    });
    const query = search.toString();
    return request<Paginated<Hospital>>(`/hospitals/${query ? `?${query}` : ''}`);
  },
  hospital: (id: string) => request<Hospital>(`/hospitals/${id}/`),
  chambers: (params: Record<string, string | number | boolean | undefined> = {}) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') search.set(key, String(value));
    });
    const query = search.toString();
    return request<Paginated<Chamber>>(`/chambers/${query ? `?${query}` : ''}`);
  },
  chamber: (id: string) => request<Chamber>(`/chambers/${id}/`),
  createChamber: (body: Record<string, unknown>) =>
    request<Chamber>('/chambers/', { method: 'POST', body }),
  updateChamber: (id: string, body: Record<string, unknown>) =>
    request<Chamber>(`/chambers/${id}/`, { method: 'PATCH', body }),
  deleteChamber: (id: string) =>
    request<void>(`/chambers/${id}/`, { method: 'DELETE' }),
};
