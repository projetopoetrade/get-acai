// src/components/produto/topping-item.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';
import { Topping } from '@/data/toppings-config';

interface ToppingItemProps {
  topping: Topping;
  quantity: number;
  showPrice: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
}

export function ToppingItem({ topping, quantity, showPrice, onIncrease, onDecrease }: ToppingItemProps) {
  const [imageError, setImageError] = useState(false);
  const isSelected = quantity > 0;

  return (
    <div
      className={`relative p-3 rounded-xl border-2 transition-all w-full border-neutral-200 dark:border-neutral-700 ${isSelected ? 'border-selected' : ''}`}
    >
      <div className="flex items-center gap-3">
        {/* Info à esquerda */}
        <div className="flex-1 min-w-0">
          <span
            className={`font-semibold text-sm block ${
              isSelected
                ? 'text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-800 dark:text-neutral-200'
            }`}
          >
            {topping.name}
          </span>
          {topping.description && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5 block">
              {topping.description}
            </span>
          )}
          {showPrice && (
            <span 
              className="text-xs font-medium mt-1 block"
              style={{ color: '#9d0094' }}
            >
              + R$ {topping.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Imagem */}
        <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%)' }}>
          {topping.imageUrl && !imageError ? (
            <Image
              src={topping.imageUrl}
              alt={topping.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #c69abf 0%, #9d0094 100%)' }}
            >
              <span className="text-white text-xl font-bold">
                {topping.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Contador à direita da imagem */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Botão - (só aparece quando qty > 0) */}
          {isSelected && (
            <button
              onClick={onDecrease}
              className="w-7 h-7 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
          )}

          {/* Quantidade (só aparece quando qty > 0) */}
          {isSelected && (
            <span className="w-5 text-center font-semibold text-neutral-900 dark:text-neutral-100">
              {quantity}
            </span>
          )}

          {/* Botão + */}
          <button
            onClick={onIncrease}
            className="w-7 h-7 flex items-center justify-center transition-colors"
            style={{ color: '#9d0094' }}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
