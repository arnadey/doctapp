import { ApiError } from '@/types/auth';

export function roleName(role: string): string {
  return role.toLowerCase();
}

export function errorMessage(error: unknown, fallback = 'Unable to complete the request.') {
  if (error instanceof ApiError) {
    const values = Object.entries(error.payload).flatMap(([field, value]) => {
      if (field === 'detail') return [String(value)];
      const messages = Array.isArray(value) ? value : [value];
      return messages.filter((item) => typeof item === 'string').map((item) => `${field}: ${item}`);
    });
    if (error.status === 403) return 'You do not have permission to perform this action.';
    if (error.status === 404) return 'The requested information was not found.';
    return values[0] ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export function formatFee(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'Not listed';
  const amount = Number(value);
  return Number.isFinite(amount) ? `${amount.toFixed(2)}` : String(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return 'Not provided';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function formatLanguages(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(', ') || 'Not listed';
  return typeof value === 'string' && value ? value : 'Not listed';
}
