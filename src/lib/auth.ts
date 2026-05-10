'use client';

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: 'admin' | 'member';
  memberId?: number;
}

export function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem('gym_token', token);
  localStorage.setItem('gym_user', JSON.stringify(user));
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('gym_user');
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem('gym_token');
  localStorage.removeItem('gym_user');
}

export function isAdmin(): boolean {
  return getUser()?.role === 'admin';
}
