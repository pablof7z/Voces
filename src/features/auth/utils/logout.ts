import { AUTH_STORAGE_KEYS } from '@/config/auth';

export function clearAuthStorage(): void {
  Object.values(AUTH_STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}