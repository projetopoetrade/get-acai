// @/components/menu/product-card.tsx
'use client';

import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Calcula a porcentagem de desconto
  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link href={`/produto/${product.id}`}>
      <div className="group relative bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 hover:shadow-lg transition-all duration-300 cursor-pointer">

        {/* Badge de Desconto (opcional) */}
        {discountPercentage > 0 && (
          <Badge className="absolute top-2 right-2 z-10 bg-red-500 text-white">
            -{discountPercentage}%
          </Badge>
        )}

        {/* Imagem do Produto */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Informações do Produto */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-neutral-900 dark:text-white line-clamp-2">
            {product.name}
          </h3>

          {/* ✅ PREÇOS LADO A LADO (HORIZONTAL) */}
          {/* Preços em Coluna */}
          <div className="space-y-0.5">
            {product.originalPrice && (
              <div className="text-xs text-neutral-400 dark:text-neutral-500 line-through">
                De: R$ {product.originalPrice.toFixed(2)}
              </div>
            )}
            <div className={`font-bold text-lg ${product.originalPrice ? 'text-[#9d0094] dark:text-[#9d0094]' : 'text-neutral-900 dark:text-white'}`}>
              R$ {product.price.toFixed(2)}
            </div>
          </div>


          {!product.available && (
            <Badge variant="secondary" className="text-xs">
              Indisponível
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
