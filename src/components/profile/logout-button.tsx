'use client';

import { logout } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1. Executa a limpeza no servidor
      await logout();
      
      // 2. Limpa qualquer estado local (se usar Context ou Zustand/Redux)
      // ex: setUser(null); 

      // 3. Força o Next.js a esquecer os dados da página atual
      router.refresh(); 
      
      // 4. Redireciona para login
      router.replace('/login');
      
    } catch (error) {
      console.error("Erro no logout", error);
      toast.error("Erro ao sair");
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