// src/components/menu/highlights-carousel.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Cherry } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { productsService } from '@/services/products';
import { Product, HighlightType } from '@/types/product';

// Cores por tipo de destaque
const HIGHLIGHT_STYLES: Record<HighlightType, { bg: string; color: string }> = {
  promo: { bg: '#fcc90c', color: '#430238' },      // Amarelo - promoção
  bestseller: { bg: '#9d0094', color: '#ffffff' }, // Roxo - mais vendido
  new: { bg: '#61c46e', color: '#ffffff' },        // Verde - novidade
  limited: { bg: '#70035e', color: '#ffffff' },    // Roxo escuro - limitado
};

function HighlightImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Cherry className="w-12 h-12" style={{ color: '#c69abf' }} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      onError={() => setError(true)}
    />
  );
}

export function HighlightsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [highlights, setHighlights] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHighlights = async () => {
      try {
        const data = await productsService.getHighlights();
        // Filtra apenas produtos disponíveis
        const availableHighlights = data.filter((p: Product) => p.available);
        setHighlights(availableHighlights);
      } catch (error) {
        console.error('Erro ao carregar destaques:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHighlights();
  }, []);

  if (loading) return null;
  if (highlights.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative py-4 bg-white dark:bg-[#1a1a1a]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Título */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-neutral-800 dark:text-white">
            Destaques
          </h2>
          
          {/* Botões de navegação (desktop) */}
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 shadow-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-600 dark:text-white"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 shadow-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-600 dark:text-white"
              aria-label="Próximo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carrossel */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 -mx-4 px-4"
        >
          {highlights.map((product) => {
            const highlightStyle = product.highlight 
              ? HIGHLIGHT_STYLES[product.highlight.type] 
              : null;

            return (
              <Link
                key={product.id}
                href={`/produto/${product.id}`}
                className="flex-shrink-0 w-72 sm:w-80"
              >
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-200 h-full border border-neutral-100 dark:border-neutral-700">
                  <div className="flex h-32">
                    {/* Imagem */}
                    <div 
                      className="relative w-32 h-full flex-shrink-0 bg-neutral-100 dark:bg-neutral-900"
                    >
                      <HighlightImage src={product.imageUrl} alt={product.name} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      {/* Badge de destaque */}
                      {product.highlight && highlightStyle && (
                        <Badge
                          className="text-[10px] w-fit font-semibold"
                          style={{ 
                            backgroundColor: highlightStyle.bg, 
                            color: highlightStyle.color 
                          }}
                        >
                          {product.highlight.label}
                        </Badge>
                      )}

                      <div>
                        <h3 className="font-semibold text-sm line-clamp-2 text-neutral-900 dark:text-white">
                          {product.name}
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                          {product.description}
                        </p>
                      </div>

                      {/* Preço */}
                      <div className="flex items-baseline gap-2">
                        {product.hasPromo && product.originalPrice && (
                          <span className="text-xs text-neutral-400 dark:text-neutral-500 line-through">
                            R$ {Number(product.originalPrice).toFixed(2)}
                          </span>
                        )}
                        <span 
                          className="text-base font-bold"
                          style={{ color: '#9d0094' }}
                        >
                          R$ {Number(product.price || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
