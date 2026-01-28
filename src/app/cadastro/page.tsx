'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/auth';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { registerSchema, type RegisterFormData } from '@/lib/validations';
import { formatPhone, unformatPhone } from '@/lib/phone-format';
import { toast } from 'sonner';
import { Info } from 'lucide-react'; // Importei um ícone para o aviso (opcional)

// Função auxiliar para formatar CPF (pode mover para um arquivo lib depois)
const formatCpf = (value: string) => {
  return value
    .replace(/\D/g, '') // Remove tudo o que não é dígito
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1'); // Limita o tamanho
};

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '', // ✅ Novo campo
    password: '',
    confirmPassword: '',
  });
  
  const [formattedPhone, setFormattedPhone] = useState('');
  const [formattedCpf, setFormattedCpf] = useState(''); // ✅ Estado visual do CPF
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setFormattedPhone(formatted);
    const numbersOnly = unformatPhone(formatted);
    updateField('phone', numbersOnly);
  };

  // ✅ Manipulador do CPF
  const handleCpfChange = (value: string) => {
    const formatted = formatCpf(value);
    setFormattedCpf(formatted);
    const numbersOnly = value.replace(/\D/g, ''); // Remove formatação para salvar
    updateField('cpf', numbersOnly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validação com Zod
    const result = registerSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof RegisterFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    // Remove confirmPassword antes de enviar
    const { confirmPassword, ...registerData } = result.data;

    // Chama Server Action
    const authResult = await register(registerData);

    if (!authResult.success) {
      const msg = authResult.error || 'Erro ao criar conta';
    
      if (msg.toLowerCase().includes('cpf')) {
        setErrors((prev) => ({ ...prev, cpf: msg }));
      } else if (msg.toLowerCase().includes('telefone')) {
        setErrors((prev) => ({ ...prev, phone: msg }));
      } else {
        setErrors((prev) => ({ ...prev, email: msg }));
      }
    
      toast.error(msg);
      setIsLoading(false);
      return;
    }
    
    toast.success('Conta criada com sucesso!');
    router.push('/');
    router.refresh();
    setIsLoading(false);
    return;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 text-center">
              Criar conta
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 text-center">
              Preencha os dados para se cadastrar
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Nome completo
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Seu nome"
                  maxLength={100}
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-transparent focus:outline-none transition-colors ${
                    errors.name
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-neutral-200 dark:border-neutral-700 focus:border-[#9d0094]'
                  }`}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
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

              {/* Grid para Telefone e CPF ficarem alinhados ou um abaixo do outro */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Telefone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formattedPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(71) 9 9999-9999"
                    maxLength={15}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-transparent focus:outline-none transition-colors ${
                      errors.phone
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-neutral-200 dark:border-neutral-700 focus:border-[#9d0094]'
                    }`}
                    disabled={isLoading}
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                  )}
                </div>

                {/* ✅ Campo de CPF Adicionado */}
                <div>
                  <label htmlFor="cpf" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    CPF
                  </label>
                  <input
                    id="cpf"
                    type="text"
                    value={formattedCpf}
                    onChange={(e) => handleCpfChange(e.target.value)}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-transparent focus:outline-none transition-colors ${
                      errors.cpf
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-neutral-200 dark:border-neutral-700 focus:border-[#9d0094]'
                    }`}
                    disabled={isLoading}
                  />
                  {/* ✅ Aviso sobre o PIX */}
                  <div className="mt-2 flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                    <Info className="w-4 h-4 text-[#9d0094] flex-shrink-0 mt-0.5" />
                    <span>
                      Necessário para emissão de notas fiscais e validação de transações via <strong>PIX</strong>.
                    </span>
                  </div>
                  {errors.cpf && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.cpf}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Confirmar senha
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  placeholder="Digite a senha novamente"
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-transparent focus:outline-none transition-colors ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-neutral-200 dark:border-neutral-700 focus:border-[#9d0094]'
                  }`}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-white font-semibold text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#9d0094' }}
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-[#9d0094] font-medium hover:underline">
                Entrar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}