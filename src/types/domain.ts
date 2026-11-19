export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type PatientProfile = {
  id: string;
  email: string;
  date_of_birth: string | null;
  gender: string;
  address: string;
  profile_picture: string | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  created_at: string;
  updated_at: string;
};

export type Doctor = {
  id: string;
  professional_name?: string | null;
  profile_picture?: string | null;
  bio?: string | null;
  specialty?: string | null;
  specialization?: DoctorSpecialization | string | null;
  qualifications?: string | null;
  experience_years?: number | null;
  consultation_fee?: string | number | null;
  languages?: unknown;
  hospital_ids?: string[] | string | null;
  hospitals?: DoctorHospitalOption[] | null;
  chambers?: Chamber[] | null;
  verification_status?: 'APPROVED' | 'PENDING' | 'REJECTED' | string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type DoctorWrite = {
  professional_name: string;
  profile_picture?: string | null;
  bio?: string;
  specialty: string;
  qualifications?: string;
  experience_years?: number;
  medical_registration_number: string;
  consultation_fee?: string;
  languages?: unknown;
};

export type DoctorAssistant = {
  id: string;
  assistant_id: string;
  assistant_email: string;
  assistant_name: string;
  active: boolean;
  can_view_patient_profiles: boolean;
  can_manage_chambers: boolean;
  created_at: string;
  updated_at: string;
};

export type DoctorAssistantCreate = {
  assistant_id: string;
  active: boolean;
  can_view_patient_profiles: boolean;
  can_manage_chambers: boolean;
};

export type Hospital = {
  id: string;
  name: string;
  description: string;
  address: string;
  contact_number: string;
  latitude: string | null;
  longitude: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Chamber = {
  id: string;
  doctor_id?: string;
  hospital?: DoctorHospitalOption | string | null;
  hospital_id?: string | null;
  chamber_name?: string | null;
  address?: string | null;
  consultation_fee_override?: string | number | null;
  active?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type DoctorSpecialization = {
  id: string;
  name: string;
};

export type DoctorSpecialtyOption = DoctorSpecialization | string;

export type DoctorHospitalOption = {
  id: string;
  name: string;
  address?: string | null;
  latitude?: string | null;
  longitude?: string | null;
};

export type DoctorFilterOptions = {
  specializations: DoctorSpecialization[];
  hospitals: DoctorHospitalOption[];
};
