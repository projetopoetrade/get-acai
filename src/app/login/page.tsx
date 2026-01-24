// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Removido import do login direto, pois vamos usar a rota de API
// import { login } from '@/lib/auth'; 
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validação com Zod
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof LoginFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      // 1. Chama a rota interna do Next.js (Proxy que define o Cookie HttpOnly)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login');
      }

      if (data.token) {
        localStorage.setItem('auth_token', data.token); // Use o nome que seu api.ts espera
      }

      // 2. Login bem sucedido!
      toast.success('Login realizado com sucesso!');

      // 3. Solução Híbrida:
      // O Cookie HttpOnly já foi definido pelo servidor (para o Middleware).
      // Agora salvamos no localStorage para o Axios (se seu frontend precisar).
      if (data.token || data.access_token) {
         localStorage.setItem('auth_token', data.token || data.access_token);
      }

      // 4. Redirecionamento Forçado
      // Usamos window.location.href em vez de router.push para garantir 
      // que os cookies sejam recarregados corretamente pelo navegador.
      window.location.href = '/'; 

    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || 'Erro ao fazer login';
      setErrors({ email: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 text-center">
              Entrar
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 text-center">
              Acesse sua conta para continuar
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="seu@email.com"
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-transparent focus:outline-none transition-colors ${
                    errors.email
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-neutral-200 dark:border-neutral-700 focus:border-[#9d0094]'
                  }`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-transparent focus:outline-none transition-colors ${
                    errors.password
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-neutral-200 dark:border-neutral-700 focus:border-[#9d0094]'
                  }`}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-white font-semibold text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#9d0094' }}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
              Não tem uma conta?{' '}
              <Link href="/cadastro" className="text-[#9d0094] font-medium hover:underline">
                Cadastre-se
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}