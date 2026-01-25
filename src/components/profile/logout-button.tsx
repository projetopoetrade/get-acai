// src/components/profile/logout-button.tsx
'use client';

import { useState } from 'react';
import { logout } from '@/app/actions/auth'; // Importe a Server Action que criamos
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // 1. Limpa localStorage e sessionStorage imediatamente
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        // Limpa o cookie no client side por garantia (nome correto: auth_token)
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }

      // 2. Chama a Server Action (ela vai deletar o cookie no servidor e redirecionar)
      await logout();
      
      toast.success('Até logo!');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao sair da conta');
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="outline"
      className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50 font-semibold text-base rounded-xl"
    >
      <LogOut className="w-5 h-5 mr-2" />
      {isLoading ? 'Saindo...' : 'Sair da Conta'}
    </Button>
  );
}