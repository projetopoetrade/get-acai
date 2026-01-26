// ARQUIVO: src/app/actions/auth.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';

export async function setAuthCookie(token: string) {
  // O await cookies() é necessário no Next.js 15
  const cookieStore = await cookies();
  
  cookieStore.set('auth_token', token, {
    httpOnly: false, // false para o cliente (axios/fetch) conseguir ler se necessário
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 1 semana
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect('/login');
}