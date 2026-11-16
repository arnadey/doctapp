import * as SecureStore from 'expo-secure-store';

import { AuthTokens } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'doctapp.access-token';
const REFRESH_TOKEN_KEY = 'doctapp.refresh-token';

export async function loadTokens(): Promise<AuthTokens | null> {
  const [access, refresh] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  ]);
  return access && refresh ? { access, refresh } : null;
}

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.access),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refresh),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}
