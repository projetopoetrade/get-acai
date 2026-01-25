'use client';

import { useEffect, useRef, useState } from 'react';
import { Header } from '@/components/layout/header';
import { ProductCard } from '@/components/menu/product-card';
import { CategoryTabs } from '@/components/menu/category-tabs';
import { HighlightsCarousel } from '@/components/menu/highlights-carousel';
import { Badge } from '@/components/ui/badge';
import { productsService } from '@/services/products';
import { Product } from '@/types/product';
import { useCategories } from '@/hooks/useCategories';

// Normalizar categoria para comparação (remove acentos e converte para minúsculas)
const normalizeCategory = (category: string): string => {
  return category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
};

export default function HomePage() {
  const { categories, isLoading: loadingCategories } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Define categoria ativa inicial quando as categorias carregarem
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);


  // ✅ Carrega produtos reais do backend (apenas disponíveis)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Filtra apenas produtos disponíveis na página principal
        const allProducts = await productsService.getAll(true);
        setProducts(allProducts as Product[]);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Scroll suave entre categorias
  const handleCategoryClick = (categoryId: string) => {
    const section = sectionRefs.current[categoryId];
    if (section) {
      const headerOffset = 60;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Detectar categoria ativa no scroll
  useEffect(() => {
    if (categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    );

    categories.forEach((cat) => {
      const section = sectionRefs.current[cat.id];
      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, [categories]);

  // ✅ Filtra produtos por categoria (dados reais)
  const getProductsByCategory = (categoryId: string) => {
    const normalizedTarget = normalizeCategory(categoryId);
    return products.filter((p) => {
      const productCategory = p.category || (p as any).categoryId || '';
      return normalizeCategory(productCategory) === normalizedTarget;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Header fixo */}
      <Header />

      {/* Carrossel de Destaques */}
      <HighlightsCarousel />

      {/* Category Tabs */}
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryClick}
        categories={categories.map(cat => ({ id: cat.id, label: cat.label }))}
      />

      {/* Seções de produtos */}
      <div className="max-w-5xl mx-auto px-4 pb-24">
        {categories.map((category) => {
          const categoryProducts = getProductsByCategory(category.id);

          return (
            <section
              key={category.id}
              id={category.id}
              ref={(el) => { sectionRefs.current[category.id] = el; }}
              className="py-6 scroll-mt-16"
            >
              {/* Título */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                  {category.label}
                  {category.badge && (
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 text-xs">
                      {category.badge}
                    </Badge>
                  )}
                </h2>
                {category.description && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Grid de produtos */}
              {categoryProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {categoryProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  <p>Nenhum produto disponível nesta categoria</p>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
