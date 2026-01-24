// src/components/profile/logout-button.tsx (VERSÃO CORRIGIDA)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // Limpar cookies do server
      await logout();
      
      // Limpar cookies do client também (garantir)
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      // Limpar localStorage (se tiver alguma coisa)
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      toast.success('Logout realizado com sucesso!');
      
      // Redirecionar e forçar reload
      router.push('/');
      router.refresh();
      
      // Força reload da página (limpa cache)
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="outline"
      className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50 font-semibold text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <LogOut className="w-5 h-5 mr-2" />
      {isLoading ? 'Saindo...' : 'Sair da Conta'}
    </Button>
  );
}
