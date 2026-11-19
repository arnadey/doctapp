import { describe, expect, it } from '@jest/globals';
import { ApiError } from '@/types/auth';
import {
  buildDoctorFilterQuery, errorMessage, formatFee, formatLanguages,
  removeStaleSpecialty, roleName,
} from '@/utils/domain';

describe('domain utilities', () => {
  it('normalizes role names', () => {
    expect(roleName('DOCTOR')).toBe('doctor');
    expect(roleName('Assistant')).toBe('assistant');
  });

  it('formats fee and language values', () => {
    expect(formatFee('125.5')).toBe('125.50');
    expect(formatFee(null)).toBe('Not listed');
    expect(formatLanguages(['English', 'Bengali'])).toBe('English, Bengali');
  });

  it('normalizes API permission errors', () => {
    const error = new ApiError(403, { detail: 'Forbidden' });
    expect(errorMessage(error)).toBe('You do not have permission to perform this action.');
  });

  it('normalizes validation field errors', () => {
    const error = new ApiError(400, { address: ['This field is required.'] });
    expect(errorMessage(error)).toBe('address: This field is required.');
  });

  it('builds only active doctor filter query parameters', () => {
    expect(buildDoctorFilterQuery({
      search: 'heart',
      specialty: 'Cardiology',
      hospitalId: 'hospital-123',
      page: 2,
      experienceYears: undefined,
    })).toBe('search=heart&specialty=Cardiology&hospital=hospital-123&page=2');
  });

  it('removes cleared filter parameters', () => {
    expect(buildDoctorFilterQuery({ specialty: '', hospitalId: undefined })).toBe('');
  });

  it('clears a stale specialty selection', () => {
    expect(removeStaleSpecialty('Cardiology', ['Dermatology'])).toBe('');
  });
});
