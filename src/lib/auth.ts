// src/lib/auth.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { LoginCredentials, RegisterData, User, AuthResponse, AuthResult } from '@/types/auth';

// Normaliza a URL base: garante que termine com /api


const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Faz login e armazena token em HTTP-only cookie
 */
export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
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
    const res = await fetch(`${API_URL}/auth/register`, {
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
 * Busca o usuário atual da API (atualiza dados do servidor)
 */
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return null;
    }

    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      // Se token inválido, limpa cookies
      if (res.status === 401) {
        const cookieStore = await cookies();
        cookieStore.delete('access_token');
        cookieStore.delete('user');
      }
      return null;
    }

    const user: User = await res.json();

    // Atualiza cookie com dados mais recentes
    const cookieStore = await cookies();
    cookieStore.set('user', JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return user;
  } catch (error) {
    console.error('Fetch current user error:', error);
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
  // Tenta ler com o nome usado neste arquivo OU o nome usado no seu actions/auth.ts
  const token = cookieStore.get('access_token')?.value || cookieStore.get('auth_token')?.value;
  return token || null;
}

/**
 * Atualiza dados do perfil do usuário
 * CORREÇÃO: Aceita token manual como segundo parâmetro
 */
export async function updateProfile(
  data: { name?: string; phone?: string }, 
  manualToken?: string | null // ✅ NOVO PARÂMETRO
): Promise<AuthResult> {
  try {
    // 1. Tenta usar o token manual (vindo do client/localStorage)
    // 2. Se não tiver, tenta buscar nos cookies (server-side)
    let token = manualToken;
    
    if (!token) {
        token = await getAuthToken();
    }

    if (!token) {
      return {
        success: false,
        error: 'Você precisa estar logado (Token não encontrado)',
      };
    }

    const res = await fetch(`${API_URL}/users/profile`, { // Confirme se a rota é /users/profile ou /auth/me
      method: 'PATCH', // ou PUT, dependendo do seu backend
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

    // Atualiza o cookie de usuário com os dados novos
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

    const res = await fetch(`${API_URL}/users/change-password`, {
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
