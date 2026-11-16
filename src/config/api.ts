import Constants from 'expo-constants';
import { Platform } from 'react-native';

const configuredUrl = Constants.expoConfig?.extra?.apiBaseUrl ?? process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_BASE_URL =
  configuredUrl ??
  (Platform.OS === 'android'
    ? 'http://10.0.2.2:8000/api/v1'
    : 'http://localhost:8000/api/v1');

export const apiUrl = (path: string) => `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

export function mediaUrl(path: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  return `${origin}/${path.replace(/^\//, '')}`;
}
