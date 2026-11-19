import { request } from '@/api/client';
import type {
  Chamber, Doctor, DoctorAssistant, DoctorAssistantCreate,
  Hospital, Paginated, PatientProfile,
} from '@/types/domain';

export type DoctorFilters = {
  search?: string;
  specialty?: string;
  experience_years?: number;
  consultation_fee?: number;
  hospital?: string;
  location?: string;
  ordering?: string;
  page?: number;
};

export const domainApi = {
  patientMe: () => request<PatientProfile>('/patients/me/'),
  updatePatientMe: (body: Record<string, unknown> | FormData) =>
    request<PatientProfile>('/patients/me/', { method: 'PATCH', body }),
  doctors: (filters: DoctorFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) params.set(key, String(value));
    });
    const query = params.toString();
    return request<Paginated<Doctor>>(`/doctors/${query ? `?${query}` : ''}`);
  },
  doctor: (id: string) => request<Doctor>(`/doctors/${id}/`),
  doctorMe: () => request<Doctor>('/doctors/me/'),
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
