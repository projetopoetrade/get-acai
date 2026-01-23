// src/lib/auth-client.ts
'use client';

import type { User } from '@/types/auth';

/**
 * Obtém dados do usuário do cookie (client-side)
 */
export function getUserFromCookie(): User | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const userCookie = cookies.find((c) => c.trim().startsWith('user='));

  if (!userCookie) return null;

  try {
    const value = userCookie.split('=')[1];
    return JSON.parse(decodeURIComponent(value));
  } catch {
    return null;
  }
}
