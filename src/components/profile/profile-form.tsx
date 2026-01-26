'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updateProfile } from '@/lib/auth'; 
import { updateProfileSchema, type UpdateProfileFormData } from '@/lib/validations';
import { formatPhone, unformatPhone } from '@/lib/phone-format';
import { toast } from 'sonner';
import type { User } from '@/types/auth';

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || '',
  });
  const [formattedPhone, setFormattedPhone] = useState(formatPhone(user.phone || ''));
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateProfileFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof UpdateProfileFormData, value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const result = updateProfileSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof UpdateProfileFormData, string>> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof UpdateProfileFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      // ✅ PASSO CRUCIAL: Pegar token do navegador
      const token = localStorage.getItem('auth_token');

      // ✅ Enviar token para a Server Action
      // @ts-ignore (caso o typescript reclame antes de você salvar o arquivo lib/auth.ts)
      const authResult = await updateProfile(result.data, token);

      if (authResult.success) {
        toast.success('Perfil atualizado com sucesso!');
        router.refresh();
      } else {
        toast.error(authResult.error || 'Erro ao atualizar perfil');
        if (authResult.error && !authResult.error.includes('logado')) {
             setErrors({ name: authResult.error });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro de comunicação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* SEUS CAMPOS DE INPUT (MANTENHA IGUAL AO QUE JÁ TEM) */}
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
          value={user.email}
          disabled
          className="w-full px-4 py-3 rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 cursor-not-allowed"
        />
        <p className="mt-1.5 text-xs text-neutral-500">O email não pode ser alterado</p>
      </div>

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

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 text-white font-semibold text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#9d0094' }}
      >
        {isLoading ? 'Salvando...' : 'Salvar alterações'}
      </Button>
    </form>
  );
}