// src/components/profile/logout-button.tsx
'use client';

import { useState } from 'react';
import { logout } from '@/lib/auth'; // Importe a Server Action que criamos
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1. Chama a server action (que SÓ apaga o cookie, sem redirect)
      await logout(); 
      
      // 2. Redireciona no cliente (mais seguro contra o erro que você teve)
      router.replace('/login');
      router.refresh(); // Garante que limpe o cache do cliente
      
    } catch (error) {
      console.error("Erro no logout", error);
    }
  };

  return (
    <button onClick={handleLogout} className="...">
      <LogOut className="w-4 h-4 mr-2" />
      Sair
    </button>
  );
}

