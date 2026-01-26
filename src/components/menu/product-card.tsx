// src/components/menu/product-card.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cherry } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/produto/${product.id}`}>
      <Card className="relative overflow-hidden group hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer dark:bg-card dark:border-border h-full p-0 flex flex-col">
        {/* Badge de Promoção */}
        {product.hasPromo && product.promoText && (
          <Badge 
            className="absolute top-2 right-2 z-10 font-semibold shadow-sm"
            style={{ backgroundColor: '#fcc90c', color: '#430238' }}
          >
            {product.promoText}
          </Badge>
        )}

        {/* Imagem do Produto */}
        {/* ✅ MUDANÇA 1: Fundo branco limpo (sem degradê) */}
        <div className="relative aspect-square overflow-hidden bg-white border-b border-neutral-100 dark:border-neutral-800">
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
              <Cherry className="w-16 h-16" style={{ color: '#c69abf' }} />
            </div>
          ) : (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 25vw"
              onError={() => setImageError(true)}
            />
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
          <div className="min-h-[60px]">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1 text-neutral-900 dark:text-neutral-100">
              {product.name}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
              {product.description}
            </p>
          </div>

          {/* Preço */}
          <div className="flex flex-col pt-1">
            {product.hasPromo && product.originalPrice && (
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 line-through">
                R$ {Number(product.originalPrice).toFixed(2)}
              </span>
            )}
            <span 
              className="text-lg font-bold"
              style={{ color: '#9d0094' }}
            >
              R$ {Number(product.price || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}