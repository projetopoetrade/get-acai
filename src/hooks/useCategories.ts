'use client';

import { useState, useEffect } from 'react';
import { categoriesService, Category } from '@/services/categories';

export interface FrontendCategory {
  id: string; // Slug da categoria (ex: "promo-do-dia", "monte-o-seu")
  label: string; // Nome para exibição
  description?: string;
  badge?: string;
  backendCategoryId?: string; // UUID da categoria no banco (para operações admin)
}

// ✅ MESMA função do products.ts (consistência garantida)
const createCategorySlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-'); // Substitui espaços por hífens
};

// ✅ OPCIONAL: Badges específicos por categoria (pode customizar aqui)
const getCategoryBadge = (categoryName: string): string | undefined => {
  const normalized = createCategorySlug(categoryName);
  
  // Adicione badges personalizados aqui
  if (normalized === 'combos') return '15% OFF';
  if (normalized === 'promo-do-dia') return 'NOVO';
  
  return undefined;
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
        
        // ✅ Mapeia categorias do backend para formato do frontend
        const mappedCategories: FrontendCategory[] = backendCategories.map((cat: Category) => {
          const slug = createCategorySlug(cat.name);
          
          return {
            id: slug, // ✅ Slug gerado dinamicamente
            label: cat.name,
            backendCategoryId: cat.id, // UUID mantido para operações admin
            description: cat.description,
            badge: getCategoryBadge(cat.name),
          };
        });

        // ✅ Ordena por order se disponível
        mappedCategories.sort((a, b) => {
          const catA = backendCategories.find(c => c.id === a.backendCategoryId);
          const catB = backendCategories.find(c => c.id === b.backendCategoryId);
          const orderA = catA?.order ?? 999;
          const orderB = catB?.order ?? 999;
          return orderA - orderB;
        });

        setCategories(mappedCategories);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[useCategories] Categorias carregadas:', mappedCategories);
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        setIsError(true);
        
        // ✅ Fallback para categorias padrão em caso de erro
        setCategories([
          { id: 'combos', label: 'Combos', badge: '15% OFF' },
          { id: 'monte-o-seu', label: 'Monte o Seu', description: 'Personalize seu açaí' },
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
