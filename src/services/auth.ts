// src/services/auth.ts
'use client';

import api from '@/lib/api';
import type { User } from '@/types/auth';

export const authService = {
  /**
   * Busca dados do usuário atual da API
   * Mais seguro que localStorage pois valida token no servidor
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token inválido, limpa localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
      return null;
    }
  },
};
