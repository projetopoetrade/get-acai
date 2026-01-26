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
  
  // Opção 1: O método padrão do Next.js
  cookieStore.delete('auth_token');

  // Opção 2 (Garantia): Forçar expiração imediata sobrescrevendo
  // Isso resolve casos onde o delete falha por conflito de path
  cookieStore.set('auth_token', '', {
    maxAge: 0,
    path: '/', // Tem que bater com o path da criação
  });

  return { success: true };
}