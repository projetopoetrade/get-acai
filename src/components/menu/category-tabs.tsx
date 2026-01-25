// src/components/menu/category-tabs.tsx
'use client';

import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categories: Array<{ id: string; label: string }>;
}

export function CategoryTabs({ activeCategory, onCategoryChange, categories }: CategoryTabsProps) {
  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-card border-b dark:border-border shadow-sm transition-colors">
      <div className="max-w-5xl mx-auto flex gap-2 p-3 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              'px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200',
              activeCategory === cat.id
                ? 'text-white shadow-md scale-105'
                : 'bg-neutral-100 dark:bg-muted text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-muted/80'
            )}
            style={activeCategory === cat.id ? { backgroundColor: '#9d0094' } : undefined}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
