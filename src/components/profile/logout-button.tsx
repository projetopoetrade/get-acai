'use client';

import { logout } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1. Pede para o servidor apagar o cookie
      await logout(); 
      
      // 2. Limpa o cache do Next.js (Crucial para atualizar o estado de autenticação)
      router.refresh();
      
      // 3. Redireciona manualmente
      router.replace('/login');
      
    } catch (error) {
      console.error("Erro no logout", error);
      // Mesmo com erro, forçamos o redirecionamento para não prender o usuário
      router.replace('/login');
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium w-full px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-lg"
    >
      <LogOut className="w-4 h-4" />
      <span>Sair</span>
    </button>
  );
}