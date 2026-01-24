import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um valor monetário de forma segura
 * @param value - Valor numérico (pode ser null, undefined, string ou number)
 * @param options - Opções de formatação
 * @returns String formatada como "R$ X,XX" ou "Grátis" se for 0
 */
export function formatMoney(
  value: number | string | null | undefined,
  options?: {
    showFree?: boolean; // Se true, mostra "Grátis" quando for 0
    freeText?: string; // Texto customizado para valor 0 (padrão: "Grátis")
  }
): string {
  // Normaliza o valor: converte para número, tratando null/undefined como 0
  const numValue = typeof value === 'string' 
    ? parseFloat(value) || 0 
    : Number(value) || 0;

  // Se for 0 e showFree estiver habilitado (ou não especificado), mostra "Grátis"
  if (numValue === 0 && (options?.showFree !== false)) {
    return options?.freeText || 'Grátis';
  }

  // Formata como moeda brasileira
  return `R$ ${numValue.toFixed(2).replace('.', ',')}`;
}

/**
 * Obtém o valor numérico seguro de um valor monetário
 * @param value - Valor que pode ser null, undefined, string ou number
 * @returns Número sempre válido (0 se inválido)
 */
export function safeMoneyValue(value: number | string | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return Number(value) || 0;
}
