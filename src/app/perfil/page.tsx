'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // ✅ Adicionado usePathname
import { Header } from '@/components/layout/header';
import { ProfileForm } from '@/components/profile/profile-form';
import { ChangePasswordForm } from '@/components/profile/change-password-form';
import { LogoutButton } from '@/components/profile/logout-button';
import { Loader2, MapPin, MapPinned } from 'lucide-react';
import type { User } from '@/types/auth';

export default function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname(); // ✅ Pega a rota atual ("/perfil")
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { authService } = await import('@/services/auth');
        const userData = await authService.getCurrentUser();

        if (userData) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Tenta cache local
          const userStr = localStorage.getItem('user');
          if (userStr) {
            setUser(JSON.parse(userStr));
          } else {
            // ✅ REDIRECIONAMENTO AUTOMÁTICO (Opcional, mas recomendado)
            // Se não tiver usuário nem no cache, já manda pro login direto
            // router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        // Fallback
        const userStr = localStorage.getItem('user');
        if (userStr) setUser(JSON.parse(userStr));
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [pathname, router]); // Adicionado deps

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#9d0094]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Você precisa estar logado para acessar esta página.
            </p>
            {/* ✅ BOTÃO ATUALIZADO: */}
            <button
              onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)}
              className="px-4 py-2 bg-[#9d0094] text-white rounded-xl font-medium"
            >
              Fazer Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Dados do Perfil */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Meu Perfil
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Gerencie suas informações pessoais
            </p>

            <ProfileForm user={user} />
          </div>

          {/* Gerenciar Endereços */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Meus Endereços
              </h2>
              <MapPin className="text-[#9d0094] w-5 h-5" />
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Cadastre e gerencie seus locais de entrega favoritos
            </p>

            <button
              onClick={() => router.push('/perfil/enderecos')}
              className="w-full py-3 px-4 border-2 border-[#9d0094] text-[#9d0094] hover:bg-[#9d0094]/5 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <MapPinned className="w-5 h-5" />
              Gerenciar Endereços
            </button>
          </div>

          {/* Alterar Senha */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Alterar Senha
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Mantenha sua conta segura com uma senha forte
            </p>

            <ChangePasswordForm />
          </div>

          {/* Botão de Logout */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Sair da Conta
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Encerrar sua sessão neste dispositivo
            </p>

            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}