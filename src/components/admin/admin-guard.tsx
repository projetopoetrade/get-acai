'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ordersService } from '@/services/orders';
import { Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Tenta fazer uma requisição que SÓ admin pode fazer
        await ordersService.getAllOrders();
        setAuthorized(true);
      } catch (error) {
        console.error('Acesso negado:', error);
        // Se der erro (403 Forbidden), chuta para a home
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  if (!authorized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#9d0094] mx-auto mb-4" />
            <p className="text-neutral-500">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}