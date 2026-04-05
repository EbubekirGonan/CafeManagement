import type { User } from '../types';

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function removeToken(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function setUser(user: User): void {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUser(): User | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  return JSON.parse(raw);
}

export function getRole(): string | null {
  const user = getUser();
  return user?.role ?? null;
}
