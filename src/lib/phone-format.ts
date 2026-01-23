// src/lib/phone-format.ts

/**
 * Formata telefone brasileiro (71) 9 9999-9999
 */
export function formatPhone(value: string): string {
    const numbers = value.replace(/\D/g, '');
  
    if (numbers.length <= 2) {
      return numbers;
    }
    if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }
    if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  }
  
  /**
   * Remove formatação, deixando apenas números
   */
  export function unformatPhone(value: string): string {
    return value.replace(/\D/g, '');
  }
  