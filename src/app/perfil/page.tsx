// src/app/perfil/page.tsx
import { getCurrentUser } from '@/lib/auth';
import { Header } from '@/components/layout/header';
import { ProfileForm } from '@/components/profile/profile-form';
import { ChangePasswordForm } from '@/components/profile/change-password-form';

export default async function ProfilePage() {
  let user = await getCurrentUser();

  // 🔧 MOCK TEMPORÁRIO PARA DEV (REMOVER DEPOIS)
  if (!user) {
    user = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'João Silva',
      email: 'joao@teste.com',
      phone: '71999999999',
    };
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 px-4 py-8 pb-24"> {/* MUDANÇA AQUI: pb-24 = padding-bottom 6rem */}
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Banner de desenvolvimento */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-sm text-yellow-800">
                🔧 Modo de desenvolvimento - Usando dados mock
              </p>
            </div>
          )}

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
        </div>
      </div>
    </div>
  );
}
