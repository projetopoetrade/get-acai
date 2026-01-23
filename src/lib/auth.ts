// src/lib/auth.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { LoginCredentials, RegisterData, User, AuthResponse, AuthResult } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Faz login e armazena token em HTTP-only cookie
 */
export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const error = await res.json();
      return {
        success: false,
        error: error.message || 'Email ou senha incorretos',
      };
    }

    const data: AuthResponse = await res.json();

    const cookieStore = await cookies();
    
    cookieStore.set('access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    cookieStore.set('user', JSON.stringify(data.user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Erro ao conectar com servidor. Verifique sua conexão.',
    };
  }
}

/**
 * Faz cadastro de novo usuário
 */
export async function register(data: RegisterData): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      return {
        success: false,
        error: error.message || 'Erro ao criar conta',
      };
    }

    const authData: AuthResponse = await res.json();

    const cookieStore = await cookies();
    
    cookieStore.set('access_token', authData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    cookieStore.set('user', JSON.stringify(authData.user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      error: 'Erro ao conectar com servidor. Verifique sua conexão.',
    };
  }
}

/**
 * Faz logout removendo cookies
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('user');
  redirect('/');
}

/**
 * Obtém usuário atual do cookie
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user');

  if (!userCookie) return null;

  try {
    return JSON.parse(userCookie.value);
  } catch {
    return null;
  }
}

/**
 * Verifica se usuário está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token');
  return !!token;
}

/**
 * Obtém o token (uso interno)
 */
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('access_token');
  return tokenCookie?.value || null;
}

/**
 * Atualiza dados do perfil do usuário
 */
export async function updateProfile(data: {
  name?: string;
  phone?: string;
}): Promise<AuthResult> {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        error: 'Você precisa estar logado',
      };
    }

    const res = await fetch(`${API_URL}/api/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      return {
        success: false,
        error: error.message || 'Erro ao atualizar perfil',
      };
    }

    const updatedUser: User = await res.json();

    const cookieStore = await cookies();
    cookieStore.set('user', JSON.stringify(updatedUser), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: 'Erro ao conectar com servidor',
    };
  }
}

/**
 * Altera a senha do usuário
 */
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        error: 'Você precisa estar logado',
      };
    }

    const res = await fetch(`${API_URL}/api/users/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      return {
        success: false,
        error: error.message || 'Senha atual incorreta',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      error: 'Erro ao conectar com servidor',
    };
  }
}
