// src/app/produto/[id]/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Minus, Plus, Check, UtensilsCrossed, Cherry, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { productsService } from '@/services/products';
import { toppingsService, type Topping } from '@/services/toppings';
import { useCart, createCustomization } from '@/hooks/useCart';
import { toast } from 'sonner';
import { ToppingItem } from '@/components/produto/topping-item';
import { Product, ProductCategory } from '@/types/product';
import { sanitizeObservations } from '@/lib/sanitize';
import type { ToppingCategory } from '@/data/toppings-config';

// Labels das categorias (fallback se não vier da API)
const TOPPING_CATEGORY_LABELS: Record<ToppingCategory, string> = {
  frutas: 'Frutas',
  complementos: 'Complementos',
  cremes: 'Cremes',
  caldas: 'Caldas',
  extras: 'Extras Premium',
};

const ALL_TOPPING_CATEGORIES: ToppingCategory[] = ['frutas', 'complementos', 'cremes', 'caldas', 'extras'];

// Labels de tamanhos
const SIZE_LABELS: Record<string, { name: string; ml: number }> = {
  pequeno: { name: 'Pequeno', ml: 300 },
  medio: { name: 'Médio', ml: 500 },
  grande: { name: 'Grande', ml: 700 },
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();

  const productId = params.id as string;

  // Estados de dados da API
  const [product, setProduct] = useState<Product | null>(null);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [toppingLimits, setToppingLimits] = useState<Record<string, Record<ToppingCategory, number>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toppingQuantities, setToppingQuantities] = useState<Record<string, number>>({});
  const [skippedCategories, setSkippedCategories] = useState<Record<ToppingCategory, boolean>>({} as Record<ToppingCategory, boolean>);
  const [wantsCutlery, setWantsCutlery] = useState<boolean | null>(null);
  const [observations, setObservations] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  // Carregar dados da API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const isDev = process.env.NODE_ENV === 'development';

        if (isDev) {
          console.log('[ProductPage] Carregando produto:', productId);
        }

        // Carregar produto
        const productData = await productsService.getOne(productId);

        if (isDev) {
          console.log('[ProductPage] Produto carregado:', productData);
        }

        // Mapear produto para formato esperado
        const mappedProduct: Product = {
          id: productData.id,
          name: productData.name,
          description: productData.description || '',
          price: typeof productData.price === 'string' ? parseFloat(productData.price) : Number(productData.price) || 0,
          originalPrice: productData.originalPrice ? (typeof productData.originalPrice === 'string' ? parseFloat(productData.originalPrice) : Number(productData.originalPrice)) : undefined,
          // Para esta versão segura:
          category: (() => {
            const cat = productData.category;
            // Se for string, usa ela. Se for objeto, pega o .name. Se não, fallback.
            const categoryName = typeof cat === 'string'
              ? cat
              : (cat as any)?.name || 'monte-seu';

            return categoryName.toLowerCase() as ProductCategory;
          })(),
          imageUrl: productData.imageUrl || '/placeholder-product.jpg',
          available: productData.available ?? true,
          isCombo: (productData as any).isCombo,
          isCustomizable: (productData as any).isCustomizable ?? true,
          hasPromo: (productData as any).hasPromo,
          promoText: (productData as any).promoText,
          sizeId: (() => {
            const size = (productData as any).size;
            if (!size) return undefined;

            // Tentar mapear pelo name primeiro
            const sizeName = (size.name || '').toLowerCase();
            if (sizeName.includes('pequeno') || sizeName.includes('300')) return 'pequeno';
            if (sizeName.includes('medio') || sizeName.includes('médio') || sizeName.includes('500')) return 'medio';
            if (sizeName.includes('grande') || sizeName.includes('700')) return 'grande';

            // Tentar mapear pelo ID (pode ser UUID ou string)
            const sizeId = (size.id || '').toLowerCase();
            if (sizeId.includes('pequeno') || sizeId.includes('300')) return 'pequeno';
            if (sizeId.includes('medio') || sizeId.includes('médio') || sizeId.includes('500')) return 'medio';
            if (sizeId.includes('grande') || sizeId.includes('700')) return 'grande';

            return undefined;
          })(),
          sizeGroup: (productData as any).sizeGroup,
        };

        setProduct(mappedProduct);

        // Carregar toppings
        if (isDev) {
          console.log('[ProductPage] Carregando toppings...');
        }
        const toppingsData = await toppingsService.getAll();

        if (isDev) {
          console.log('[ProductPage] Toppings carregados:', toppingsData.length, 'itens');
        }

        setToppings(toppingsData);

        // Carregar limites de toppings
        try {
          if (isDev) {
            console.log('[ProductPage] Carregando limites de toppings para produto:', productId);
          }
          const limitsData = await toppingsService.getProductLimits(productId);

          if (isDev) {
            console.log('[ProductPage] Limites carregados:', limitsData);
          }
          const limitsMap: Record<string, Record<ToppingCategory, number>> = {};

          limitsData.forEach(limit => {
            if (!limitsMap[limit.sizeId]) {
              limitsMap[limit.sizeId] = {
                frutas: 0,
                complementos: 0,
                cremes: 0,
                caldas: 0,
                extras: 0,
              };
            }
            // Mapear categoria da API para formato interno
            const category = limit.toppingCategoryName.toLowerCase();
            if (category.includes('fruta')) limitsMap[limit.sizeId].frutas = limit.maxQuantity;
            else if (category.includes('complemento')) limitsMap[limit.sizeId].complementos = limit.maxQuantity;
            else if (category.includes('creme')) limitsMap[limit.sizeId].cremes = limit.maxQuantity;
            else if (category.includes('calda')) limitsMap[limit.sizeId].caldas = limit.maxQuantity;
            else if (category.includes('extra') || category.includes('premium')) limitsMap[limit.sizeId].extras = limit.maxQuantity;
          });

          setToppingLimits(limitsMap);
        } catch {
          // Se não conseguir carregar limites, usar padrão
          setToppingLimits({});
        }

      } catch (err: any) {
        console.error('[ProductPage] Erro ao carregar dados:', err);
        console.error('[ProductPage] Erro completo:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          statusText: err.response?.statusText,
          url: err.config?.url,
          params: err.config?.params,
        });

        // Extrair mensagem de erro do backend
        let errorMessage = 'Erro ao carregar produto';
        if (err.response?.data) {
          // NestJS pode retornar message como array ou string
          if (Array.isArray(err.response.data.message)) {
            errorMessage = err.response.data.message.join(', ');
          } else if (typeof err.response.data.message === 'string') {
            errorMessage = err.response.data.message;
          } else if (err.response.data.error) {
            errorMessage = typeof err.response.data.error === 'string'
              ? err.response.data.error
              : JSON.stringify(err.response.data.error);
          }
        } else if (err.message) {
          errorMessage = err.message;
        }

        // Sempre logar erros (importante para debug)
        console.error('[ProductPage] Mensagem de erro final:', errorMessage);
        if (process.env.NODE_ENV === 'development') {
          console.error('[ProductPage] Response data completo:', err.response?.data);
        }
        setError(errorMessage); // Sempre string

        toast.error('Erro ao carregar produto', {
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId]);

  // Funções auxiliares usando dados da API
  const getToppingsByCategory = (category: ToppingCategory): Topping[] => {
    return toppings
      .filter(t => t.category === category && (t.inStock || t.available))
      .sort((a, b) => a.order - b.order);
  };

  const getToppingLimit = (sizeId: string | undefined, category: ToppingCategory): number => {
    if (!sizeId) return 0;
    // Tentar buscar limite específico do tamanho
    const sizeLimits = toppingLimits[sizeId];
    if (sizeLimits) {
      return sizeLimits[category] || 0;
    }
    // Fallback: limites padrão (pode vir da API ou usar valores padrão)
    const defaultLimits: Record<ToppingCategory, number> = {
      frutas: sizeId === 'pequeno' ? 2 : sizeId === 'medio' ? 3 : 4,
      complementos: sizeId === 'pequeno' ? 2 : sizeId === 'medio' ? 3 : 4,
      cremes: sizeId === 'pequeno' ? 1 : sizeId === 'medio' ? 1 : 2,
      caldas: sizeId === 'pequeno' ? 1 : sizeId === 'medio' ? 2 : 2,
      extras: 0,
    };
    return defaultLimits[category] || 0;
  };

  // Tamanho atual do produto (para calcular limites)
  const currentSizeId = product?.sizeId;

  // Calcular preço total
  const totalPrice = useMemo(() => {
    if (!product) return 0;

    let price = typeof product.price === 'number'
      ? product.price
      : Number(product.price) || 0;

    // Adicionar preço dos toppings extras (além do limite grátis)
    ALL_TOPPING_CATEGORIES.forEach((category) => {
      const categoryToppings = getToppingsByCategory(category);
      const freeLimit = getToppingLimit(currentSizeId, category);
      const isExtras = category === 'extras';

      // Contar total de itens selecionados na categoria
      let totalInCategory = 0;
      categoryToppings.forEach((topping) => {
        const qty = toppingQuantities[topping.id] || 0;
        totalInCategory += qty;
      });

      // Calcular quantos são pagos
      if (isExtras) {
        // Extras sempre são pagos
        categoryToppings.forEach((topping) => {
          const qty = toppingQuantities[topping.id] || 0;
          price += topping.price * qty;
        });
      } else {
        // Outras categorias: cobra apenas o que exceder o limite grátis
        const paidQuantity = Math.max(0, totalInCategory - freeLimit);
        if (paidQuantity > 0) {
          // Cobra os toppings mais caros primeiro (que excedem o limite)
          const selectedWithQty = categoryToppings
            .filter((t) => (toppingQuantities[t.id] || 0) > 0)
            .flatMap((t) => Array((toppingQuantities[t.id] || 0)).fill(t))
            .sort((a, b) => b.price - a.price);

          selectedWithQty.slice(0, paidQuantity).forEach((topping) => {
            price += topping.price;
          });
        }
      }
    });

    return price * quantity;
  }, [product, toppingQuantities, quantity, currentSizeId, toppings]);

  // Validação: verificar se todos os campos obrigatórios foram preenchidos
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Categorias gratuitas que são obrigatórias
    const freeCategories: ToppingCategory[] = ['frutas', 'complementos', 'cremes'];

    // Verificar cada categoria gratuita
    freeCategories.forEach((category) => {
      const isSkipped = skippedCategories[category] || false;
      const categoryToppings = getToppingsByCategory(category);
      const hasSelection = categoryToppings.some(
        (topping) => (toppingQuantities[topping.id] || 0) > 0
      );

      // Deve ter seleção OU ter sido skipada
      if (!isSkipped && !hasSelection) {
        const categoryLabel = TOPPING_CATEGORY_LABELS[category];
        errors.push(`Selecione ${categoryLabel.toLowerCase()} ou escolha "Não quero ${categoryLabel.toLowerCase()}"`);
      }
    });

    // Talher é obrigatório
    if (wantsCutlery === null) {
      errors.push('Escolha se deseja talheres ou não');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Verificar se o formulário é válido
  const isFormValid = useMemo(() => {
    const errors: string[] = [];
    const freeCategories: ToppingCategory[] = ['frutas', 'complementos', 'cremes'];

    // Verificar cada categoria gratuita
    freeCategories.forEach((category) => {
      const isSkipped = skippedCategories[category] || false;
      const categoryToppings = getToppingsByCategory(category);
      const hasSelection = categoryToppings.some(
        (topping) => (toppingQuantities[topping.id] || 0) > 0
      );

      if (!isSkipped && !hasSelection) {
        const categoryLabel = TOPPING_CATEGORY_LABELS[category];
        errors.push(`Selecione ${categoryLabel.toLowerCase()} ou escolha "Não quero ${categoryLabel.toLowerCase()}"`);
      }
    });

    // Talher é obrigatório
    if (wantsCutlery === null) {
      errors.push('Escolha se deseja talheres ou não');
    }

    return errors.length === 0;
  }, [toppingQuantities, skippedCategories, wantsCutlery, currentSizeId, toppings]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9d0094] mx-auto mb-4"></div>
          <p className="text-neutral-500">Carregando produto...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    const errorMessage = Array.isArray(error)
      ? error.join(', ')
      : typeof error === 'string'
        ? error
        : 'O produto que você procura não existe';

    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      console.error('[ProductPage] Estado de erro:', {
        error,
        errorMessage,
        hasProduct: !!product,
        productId,
      });
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Produto não encontrado</h1>
          <p className="text-neutral-500 mb-4">{errorMessage}</p>
          {process.env.NODE_ENV === 'development' && error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 text-left max-w-md">
              <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
                {errorMessage}
              </p>
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer text-red-500">Detalhes técnicos</summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify({ error, product: !!product }, null, 2)}
                </pre>
              </details>
            </div>
          )}
          <Button onClick={() => router.push('/')} style={{ backgroundColor: '#9d0094' }} className="text-white">
            Voltar ao menu
          </Button>
        </div>
      </div>
    );
  }

  const getSelectedCountByCategory = (category: ToppingCategory): number => {
    return getToppingsByCategory(category).reduce((sum, t) => sum + (toppingQuantities[t.id] || 0), 0);
  };

  const handleToppingIncrease = (topping: Topping) => {
    // Se a categoria estava pulada, reativa ela
    if (skippedCategories[topping.category]) {
      setSkippedCategories((prev) => ({
        ...prev,
        [topping.category]: false,
      }));
    }

    setToppingQuantities((prev) => ({
      ...prev,
      [topping.id]: (prev[topping.id] || 0) + 1,
    }));
  };

  const handleToppingDecrease = (topping: Topping) => {
    setToppingQuantities((prev) => {
      const currentQty = prev[topping.id] || 0;
      if (currentQty <= 1) {
        const updated = { ...prev };
        delete updated[topping.id];
        return updated;
      }
      return {
        ...prev,
        [topping.id]: currentQty - 1,
      };
    });
  };

  const handleSkipCategory = (category: ToppingCategory) => {
    const isCurrentlySkipped = skippedCategories[category];

    // Toggle skip state
    setSkippedCategories((prev) => ({
      ...prev,
      [category]: !isCurrentlySkipped,
    }));

    // Se está pulando, limpa as seleções dessa categoria
    if (!isCurrentlySkipped) {
      const categoryToppings = getToppingsByCategory(category);
      setToppingQuantities((prev) => {
        const updated = { ...prev };
        categoryToppings.forEach((t) => {
          delete updated[t.id];
        });
        return updated;
      });
    }
  };


  const handleAddToCart = () => {
    // Validar formulário
    const validation = validateForm();
    if (!validation.isValid) {
      validation.errors.forEach((error) => {
        toast.error(error);
      });
      return;
    }

    // Criar objeto de customização com todas as seleções usando dados da API
    const toppingsData = toppings.map(t => ({
      id: t.id,
      name: t.name,
      price: t.price,
      category: t.category,
    }));

    const limits: Record<string, number> = {};
    ALL_TOPPING_CATEGORIES.forEach(cat => {
      limits[cat] = getToppingLimit(currentSizeId, cat);
    });

    const skippedCategoriesList = Object.entries(skippedCategories)
      .filter(([, isSkipped]) => isSkipped)
      .map(([cat]) => cat);

    const customization = createCustomization(
      currentSizeId,
      toppingQuantities,
      toppingsData,
      limits,
      wantsCutlery === true, // Converter null para false
      observations,
      skippedCategoriesList
    );

    // Adicionar ao carrinho com customização
    addItem(product, quantity, customization);

    // Mensagem de confirmação
    const selectedToppingNames = toppings
      .filter((t) => (toppingQuantities[t.id] || 0) > 0)
      .map((t) => {
        const qty = toppingQuantities[t.id];
        return qty > 1 ? `${qty}x ${t.name}` : t.name;
      })
      .join(', ');

    toast.success('Adicionado ao carrinho!', {
      description: selectedToppingNames
        ? `${product.name} com ${selectedToppingNames}`
        : product.name,
      duration: 2000,
    });

    router.push('/');
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-lg truncate">{product.name}</h1>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto ">
        {/* Imagem do Produto */}
        <div className="relative w-full h-80 sm:h-96 bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-900">
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Cherry className="w-24 h-24" style={{ color: '#c69abf' }} />
            </div>
          ) : (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              // 2. Mudamos de "object-cover" para "object-contain" e adicionamos padding "p-4"
              className="object-contain p-4 hover:scale-105 transition-transform duration-300"
              priority
              onError={() => setImageError(true)}
            />
          )}
          {product.hasPromo && product.promoText && (
            <Badge
              className="absolute top-4 right-4 z-10 font-semibold text-sm px-3 py-1 shadow-sm"
              style={{ backgroundColor: '#fcc90c', color: '#430238' }}
            >
              {product.promoText}
            </Badge>
          )}
        </div>

        {/* Info do Produto */}
        <Card className="rounded-none border-x-0 border-t-0">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {product.name}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              {product.description}
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              {product.hasPromo && product.originalPrice && (
                <span className="text-sm text-neutral-400 line-through">
                  R$ {Number(product.originalPrice).toFixed(2)}
                </span>
              )}
              <span
                className="text-2xl font-bold"
                style={{ color: '#9d0094' }}
              >
                R$ {Number(product.price || 0).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Acompanhamentos */}
        {ALL_TOPPING_CATEGORIES.map((category) => {
          const toppings = getToppingsByCategory(category);
          const selectedCount = getSelectedCountByCategory(category);
          const limit = getToppingLimit(currentSizeId, category);
          const isExtras = category === 'extras';
          const isSkipped = skippedCategories[category];

          // Não mostrar categoria vazia
          if (toppings.length === 0) return null;

          return (
            <Card key={category} className="rounded-none border-x-0 border-t-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{TOPPING_CATEGORY_LABELS[category]}</CardTitle>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {isExtras
                        ? 'Adicionais pagos'
                        : limit > 0
                          ? `Escolha até ${limit} grátis`
                          : 'Selecione quantos quiser'
                      }
                    </p>
                  </div>
                  {!isExtras && limit > 0 && !isSkipped && (
                    <span
                      className={`text-sm font-medium px-2 py-0.5 rounded-full ${selectedCount >= limit
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-neutral-100 text-neutral-600 dark:bg-muted dark:text-neutral-400'
                        }`}
                    >
                      {selectedCount}/{limit}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>

                {/* Botão "Não quero" - apenas para categorias grátis */}
                {!isExtras && (
                  <button
                    onClick={() => handleSkipCategory(category)}
                    className={`w-full mb-3 p-3 rounded-xl border-2 flex items-center gap-3 transition-all border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 ${isSkipped ? 'border-selected' : ''}`}
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={isSkipped
                        ? { borderColor: '#9d0094', backgroundColor: '#9d0094' }
                        : { borderColor: '#d1d5db' }
                      }
                    >
                      {isSkipped && <X className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`font-medium text-sm ${isSkipped ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'}`}>
                      Não quero {TOPPING_CATEGORY_LABELS[category].toLowerCase()}
                    </span>
                  </button>
                )}

                {/* Lista de toppings - oculta se categoria pulada */}
                {!isSkipped && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {toppings.map((topping) => {
                      const qty = toppingQuantities[topping.id] || 0;
                      // Mostrar preço se: é extra OU se o total da categoria >= limite grátis
                      const showPrice = isExtras || selectedCount >= limit;

                      return (
                        <ToppingItem
                          key={topping.id}
                          topping={topping}
                          quantity={qty}
                          showPrice={showPrice}
                          onIncrease={() => handleToppingIncrease(topping)}
                          onDecrease={() => handleToppingDecrease(topping)}
                        />
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Talheres - Obrigatório */}
        <Card className="rounded-none border-x-0 border-t-0">
          <CardHeader>
            <CardTitle>
              Talheres <span className="text-red-500">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button
                onClick={() => setWantsCutlery(true)}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 ${wantsCutlery === true ? 'border-selected-light dark:border-selected-dark' : ''
                  }`}
              >
                <UtensilsCrossed
                  className="w-5 h-5"
                  style={{ color: wantsCutlery === true ? '#9d0094' : '#9ca3af' }}
                />
                <span className="font-medium flex-1 text-left">Quero talheres</span>
                {wantsCutlery === true && (
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: '#9d0094', backgroundColor: '#9d0094' }}
                  >
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
              <button
                onClick={() => setWantsCutlery(false)}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 ${wantsCutlery === false ? 'border-selected-light dark:border-selected-dark' : ''
                  }`}
              >
                <X
                  className="w-5 h-5"
                  style={{ color: wantsCutlery === false ? '#9d0094' : '#9ca3af' }}
                />
                <span className="font-medium flex-1 text-left">Não quero talheres</span>
                {wantsCutlery === false && (
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: '#9d0094', backgroundColor: '#9d0094' }}
                  >
                    <X className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        <Card className="rounded-none border-0 pb-0">
          <CardHeader>
            <CardTitle>Alguma observação?</CardTitle>
          </CardHeader>
          <CardContent className="pb-20">
            <textarea
              value={observations}
              onChange={(e) => setObservations(sanitizeObservations(e.target.value))}
              placeholder="Ex: Sem banana, pouco açúcar..."
              maxLength={500}
              className="w-full p-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-transparent resize-none h-24 focus:border-neutral-400 dark:focus:border-neutral-500 focus:outline-none transition-colors"
            />
          </CardContent>
        </Card>
      </div>

      {/* Footer fixo com quantidade e botão */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 shadow-lg z-50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
          {/* Quantidade */}
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-muted rounded-xl p-0.5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${quantity <= 1
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-neutral-200 dark:hover:bg-muted/80'
                }`}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-7 text-center font-semibold text-base">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-muted/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Botão Adicionar */}
          <Button
            onClick={handleAddToCart}
            disabled={!isFormValid}
            className="flex-1 h-12 text-white font-semibold text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed max-w-md"
            style={{ backgroundColor: '#139948' }}
          >
            Adicionar • R$ {totalPrice.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
