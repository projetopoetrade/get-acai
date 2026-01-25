'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';

export async function setAuthCookie(token: string) {
  (await cookies()).set('auth_token', token, {
    httpOnly: false, // Deixe false para o seu Axios no cliente ainda conseguir ler se precisar
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 1 semana
  })




}
export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    // Você pode redirecionar direto daqui se quiser
    redirect('/login');
}