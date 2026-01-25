'use client';

import { useState, useEffect } from 'react';
import { categoriesService, Category } from '@/services/categories';

export interface FrontendCategory {
  id: string; // ID do frontend (combos, monte-seu, classicos, bebidas, etc)
  label: string; // Nome para exibição
  description?: string;
  badge?: string;
  backendCategoryId?: string; // UUID da categoria no banco
}

// Mapeia nome da categoria do backend para o ID do frontend
const mapCategoryNameToFrontendId = (categoryName: string): string => {
  const normalized = categoryName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  
  if (normalized.includes('combo') || normalized === 'combos') {
    return 'combos';
  }
  if (normalized.includes('monte') || normalized.includes('personaliz') || normalized === 'monte-seu' || normalized === 'monte seu') {
    return 'monte-seu';
  }
  if (normalized.includes('classic') || normalized === 'classicos') {
    return 'classicos';
  }
  if (normalized.includes('bebida') || normalized === 'bebidas') {
    return 'bebidas';
  }
  if (normalized.includes('complement')) {
    return 'complemento';
  }
  
  // Default: usa o nome normalizado como ID
  return normalized.replace(/\s+/g, '-');
};

export function useCategories() {
  const [categories, setCategories] = useState<FrontendCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        
        const backendCategories = await categoriesService.getAll();
        
        // Mapeia categorias do backend para formato do frontend
        const mappedCategories: FrontendCategory[] = backendCategories.map((cat: Category) => {
          const frontendId = mapCategoryNameToFrontendId(cat.name);
          
          return {
            id: frontendId,
            label: cat.name,
            backendCategoryId: cat.id,
            description: cat.description,
            // Adiciona badge para combos se necessário
            badge: frontendId === 'combos' ? '15% OFF' : undefined,
          };
        });

        // Ordena por order se disponível, senão mantém ordem original
        mappedCategories.sort((a, b) => {
          const catA = backendCategories.find(c => mapCategoryNameToFrontendId(c.name) === a.id);
          const catB = backendCategories.find(c => mapCategoryNameToFrontendId(c.name) === b.id);
          const orderA = catA?.order ?? 999;
          const orderB = catB?.order ?? 999;
          return orderA - orderB;
        });

        setCategories(mappedCategories);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        setIsError(true);
        // Fallback para categorias padrão em caso de erro
        setCategories([
          { id: 'combos', label: 'Combos', badge: '15% OFF' },
          { id: 'monte-seu', label: 'Monte o Seu', description: 'Personalize seu açaí' },
          { id: 'classicos', label: 'Clássicos', description: 'Combinações especiais' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  return {
    categories,
    isLoading,
    isError,
  };
}
