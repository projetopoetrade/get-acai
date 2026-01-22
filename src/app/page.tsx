// src/app/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Header } from '@/components/layout/header';
import { ProductCard } from '@/components/menu/product-card';
import { CategoryTabs } from '@/components/menu/category-tabs';
import { HighlightsCarousel } from '@/components/menu/highlights-carousel';
import { mockProducts } from '@/data/products';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = [
  { id: 'combos', label: 'Combos', badge: '15% OFF' },
  { id: 'monte-seu', label: 'Monte o Seu', description: 'Personalize seu açaí' },
  { id: 'classicos', label: 'Clássicos', description: 'Combinações especiais' },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('combos');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Scroll para a seção quando clicar na tab
  const handleCategoryClick = (categoryId: string) => {
    const section = sectionRefs.current[categoryId];
    if (section) {
      const headerOffset = 60; // altura das tabs
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Detectar seção visível durante scroll
  useEffect(() => {
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

    CATEGORIES.forEach((cat) => {
      const section = sectionRefs.current[cat.id];
      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  const getProductsByCategory = (categoryId: string) => {
    return mockProducts.filter((p) => p.category === categoryId);
  };

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Header fixo */}
      <Header />

      {/* Carrossel de Destaques */}
      <HighlightsCarousel />

      {/* Category Tabs - Sticky */}
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryClick}
      />

      {/* Todas as Seções */}
      <div className="max-w-5xl mx-auto px-4 pb-24">
        {CATEGORIES.map((category) => {
          const products = getProductsByCategory(category.id);

          return (
            <section
              key={category.id}
              id={category.id}
              ref={(el) => { sectionRefs.current[category.id] = el; }}
              className="py-6 scroll-mt-16"
            >
              {/* Título da Seção */}
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

              {/* Grid de Produtos - Max 4 colunas */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {products.length === 0 && (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  <p>Nenhum produto disponível</p>
                </div>
              )}
            </section>
          );
        })}
      </div>

    </div>
  );
}
