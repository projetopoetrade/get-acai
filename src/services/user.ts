// src/services/users.ts
import api from '@/lib/api'; // Supondo que você tenha um axios ou fetch wrapper, senão usamos fetch direto

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export const usersService = {
  // Busca todos os usuários (Admin Only)
  getAll: async (): Promise<User[]> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Falha ao buscar usuários');
    return response.json();
  },

  // Atualiza o cargo do usuário
  updateRole: async (id: string, role: 'admin' | 'user') => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}/role`, {
      method: 'PATCH', // ou PUT, dependendo do seu backend
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role })
    });

    if (!response.ok) throw new Error('Falha ao atualizar cargo');
    return response.json();
  }
};