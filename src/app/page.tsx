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

// Normalizar categoria para comparação
const normalizeCategory = (category: string): string => {
  return category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export default function HomePage() {
  const { categories, isLoading: loadingCategories } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9d0094]"></div>
      </div>
    );
  }

  return (
    // ✅ MUDANÇA: bg-neutral-50 para suavizar o fundo
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      <Header />
      <HighlightsCarousel />
      
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryClick}
        categories={categories.map(cat => ({ id: cat.id, label: cat.label }))}
      />

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