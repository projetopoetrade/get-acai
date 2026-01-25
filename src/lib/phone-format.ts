// src/lib/phone-format.ts

/**
 * Formata telefone brasileiro (71) 9 9999-9999
 */
export const formatPhone = (value: string) => {
  if (!value) return "";
  const numbers = value.replace(/\D/g, ""); // Remove tudo que não é número
  
  if (numbers.length <= 11) {
    // Máscara para (71) 98535-0741
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  }
  return value;
};
  
  /**
   * Remove formatação, deixando apenas números
   */
  export function unformatPhone(value: string): string {
    return value.replace(/\D/g, '');
  }
  