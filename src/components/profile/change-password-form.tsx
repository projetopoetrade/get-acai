// src/components/profile/change-password-form.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { changePassword } from '@/lib/auth';
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/validations';
import { toast } from 'sonner';

export function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ChangePasswordFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof ChangePasswordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validação com Zod
    const result = changePasswordSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ChangePasswordFormData, string>> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ChangePasswordFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    const { confirmPassword, ...passwordData } = result.data;
    const changeResult = await changePassword(passwordData);

    if (changeResult.success) {
      toast.success('Senha alterada com sucesso!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } else {
      toast.error(changeResult.error || 'Erro ao alterar senha');
      setErrors({ currentPassword: changeResult.error });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          Senha atual
        </label>
        <input
          id="currentPassword"
          type="password"
          value={formData.currentPassword}
          onChange={(e) => updateField('currentPassword', e.target.value)}
          placeholder="Digite sua senha atual"
          className={`w-full px-4 py-3 rounded-xl border-2 bg-transparent focus:outline-none transition-colors ${
            errors.currentPassword
              ? 'border-red-500 focus:border-red-500'
              : 'border-neutral-200 dark:border-neutral-700 focus:border-[#9d0094]'
          }`}
          disabled={isLoading}
        />
        {errors.currentPassword && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.currentPassword}</p>
        )}
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          Nova senha
        </label>
        <input
          id="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={(e) => updateField('newPassword', e.target.value)}
          placeholder="Mínimo 6 caracteres"
          className={`w-full px-4 py-3 rounded-xl border-2 bg-transparent focus:outline-none transition-colors ${
            errors.newPassword
              ? 'border-red-500 focus:border-red-500'
              : 'border-neutral-200 dark:border-neutral-700 focus:border-[#9d0094]'
          }`}
          disabled={isLoading}
        />
        {errors.newPassword && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          Confirmar nova senha
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => updateField('confirmPassword', e.target.value)}
          placeholder="Digite a nova senha novamente"
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
        {isLoading ? 'Alterando...' : 'Alterar senha'}
      </Button>
    </form>
  );
}
