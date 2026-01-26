// src/lib/sanitize.ts
// Funções de sanitização para inputs do usuário

/**
 * Remove tags HTML e scripts maliciosos
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitiza texto geral removendo caracteres perigosos
 * Mantém apenas texto legível
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  
  // Remove tags HTML
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove scripts inline
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+=/gi, '');
  
  // Remove caracteres de controle (exceto quebra de linha e tab)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // ✅ REMOVIDO O .trim() PARA PERMITIR DIGITAÇÃO DE ESPAÇOS
  return sanitized; 
}

/**
 * Sanitiza e limita o tamanho do texto
 */
export function sanitizeTextWithLimit(input: string, maxLength: number): string {
  const sanitized = sanitizeText(input);
  return sanitized.substring(0, maxLength);
}

/**
 * Sanitiza código de cupom (apenas letras e números)
 */
export function sanitizeCouponCode(input: string): string {
  if (!input) return '';
  
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 20);
}

/**
 * Sanitiza CEP (apenas números)
 */
export function sanitizeCep(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/\D/g, '')
    .substring(0, 8);
}

/**
 * Sanitiza número (apenas dígitos)
 */
export function sanitizeNumber(input: string): string {
  if (!input) return '';
  
  return input.replace(/\D/g, '');
}

/**
 * Sanitiza telefone (apenas números, com limite)
 */
export function sanitizePhone(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/\D/g, '')
    .substring(0, 11);
}

/**
 * Sanitiza nome (letras, espaços e acentos)
 */
export function sanitizeName(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '')
    .replace(/\s+/g, ' ')
    .substring(0, 100);
}

/**
 * Sanitiza endereço
 */
export function sanitizeAddress(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>{}[\]\\]/g, '')
    .substring(0, 200);
}

/**
 * Sanitiza observações do pedido
 */
export function sanitizeObservations(input: string): string {
  if (!input) return '';
  
  return sanitizeTextWithLimit(input, 500);
}

/**
 * Sanitiza valor monetário para troco
 */
export function sanitizeMoneyValue(input: string): string {
  if (!input) return '';
  
  // Remove tudo exceto números, vírgula e ponto
  let sanitized = input.replace(/[^\d.,]/g, '');
  
  // Substitui vírgula por ponto
  sanitized = sanitized.replace(',', '.');
  
  // Garante apenas um ponto decimal
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limita a 2 casas decimais
  if (parts.length === 2 && parts[1].length > 2) {
    sanitized = parts[0] + '.' + parts[1].substring(0, 2);
  }
  
  return sanitized;
}
