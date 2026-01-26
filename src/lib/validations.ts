// src/lib/validations.ts
// Schemas de validação usando Zod

import { z } from 'zod';

/**
 * Schema de validação para login
 */
// src/lib/validations.ts
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  // 👇 Adicione esta linha
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"), 
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Schema de validação para endereço
 */
export const addressSchema = z.object({
  label: z
    .string()
    .min(1, 'Tipo de endereço é obrigatório')
    .max(50, 'Tipo de endereço muito longo'),
  zipCode: z
    .string()
    .min(1, 'CEP é obrigatório')
    .regex(/^\d{8}$/, 'CEP deve ter 8 dígitos'),
  street: z
    .string()
    .min(1, 'Rua é obrigatória')
    .max(200, 'Rua muito longa')
    .trim(),
  number: z
    .string()
    .min(1, 'Número é obrigatório')
    .max(10, 'Número muito longo')
    .regex(/^\d+[A-Za-z]?$/, 'Número inválido'),
  complement: z
    .string()
    .max(100, 'Complemento muito longo')
    .trim()
    .optional()
    .or(z.literal('')),
  neighborhood: z
    .string()
    .min(1, 'Bairro é obrigatório')
    .max(100, 'Bairro muito longo')
    .trim(),
  city: z
    .string()
    .min(1, 'Cidade é obrigatória')
    .max(100, 'Cidade muito longa')
    .trim(),
  state: z
    .string()
    .length(2, 'Estado deve ter 2 caracteres')
    .toUpperCase(),
  reference: z
    .string()
    .max(200, 'Referência muito longa')
    .trim()
    .optional()
    .or(z.literal('')),
});

export type AddressFormData = z.infer<typeof addressSchema>;

/**
 * Schema de validação para cupom de desconto
 */
export const couponSchema = z.object({
  code: z
    .string()
    .min(1, 'Código do cupom é obrigatório')
    .max(20, 'Código muito longo')
    .toUpperCase()
    .regex(/^[A-Z0-9]+$/, 'Código deve conter apenas letras e números'),
});

export type CouponFormData = z.infer<typeof couponSchema>;

/**
 * Schema de validação para observações do pedido
 */
export const observationsSchema = z.object({
  observations: z
    .string()
    .max(500, 'Observações muito longas (máximo 500 caracteres)')
    .trim()
    .optional()
    .or(z.literal('')),
});
// src/lib/validations.ts (ADICIONAR ao final)

export const updateProfileSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
  });
  
  export const changePasswordSchema = z
    .object({
      currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
      newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'As senhas não coincidem',
      path: ['confirmPassword'],
    });
  
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ObservationsFormData = z.infer<typeof observationsSchema>;

