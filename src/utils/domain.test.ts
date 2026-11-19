import { describe, expect, it } from '@jest/globals';
import { ApiError } from '@/types/auth';
import { errorMessage, formatFee, formatLanguages, roleName } from '@/utils/domain';

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
});
