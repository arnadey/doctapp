export type AccountStatus = 'active' | 'suspended' | 'rejected' | 'pending' | 'inactive' | string;

export type AuthenticatedUser = {
  id: number | string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  role: string;
  account_status: AccountStatus;
  profile_image: string | null;
  created_at: string;
};

export type AuthTokens = {
  access: string;
  refresh: string;
};

export type ApiErrorPayload = {
  detail?: string;
  code?: string;
  [key: string]: unknown;
};

export class ApiError extends Error {
  status: number;
  payload: ApiErrorPayload;

  constructor(status: number, payload: ApiErrorPayload) {
    super(typeof payload.detail === 'string' ? payload.detail : 'The request could not be completed.');
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}
