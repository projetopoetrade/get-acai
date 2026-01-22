// src/app/produto/[id]/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Minus, Plus, Check, UtensilsCrossed, Cherry, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProductById, getSizeVariants, SIZE_LABELS } from '@/data/products';
import { useCart, createCustomization } from '@/hooks/useCart';
import { toast } from 'sonner';
import {
  getToppingLimit,
  TOPPING_CATEGORY_LABELS,
  getToppingsByCategory,
  getAllToppingCategories,
  type Topping,
  type ToppingCategory,
  TOPPINGS,
} from '@/data/toppings-config';
import { ToppingItem } from '@/components/produto/topping-item';
import { Product } from '@/types/product';
import { sanitizeObservations } from '@/lib/sanitize';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();

  const productId = params.id as string;
  const initialProduct = getProductById(productId);

  // Variantes de tamanho do produto
  const sizeVariants = initialProduct ? getSizeVariants(initialProduct) : [];
  const hasSizeVariants = sizeVariants.length > 1;

  // Produto selecionado (pode mudar ao trocar tamanho)
  const [selectedProductId, setSelectedProductId] = useState(productId);
  const selectedProduct = getProductById(selectedProductId) || initialProduct;

  const [toppingQuantities, setToppingQuantities] = useState<Record<string, number>>({});
  const [skippedCategories, setSkippedCategories] = useState<Record<ToppingCategory, boolean>>({} as Record<ToppingCategory, boolean>);
  const [wantsCutlery, setWantsCutlery] = useState<boolean | null>(null); // null = não escolhido, true/false = escolhido
  const [observations, setObservations] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  // Tamanho atual do produto (para calcular limites)
  const currentSizeId = selectedProduct?.sizeId;

  // Calcular preço total
  const totalPrice = useMemo(() => {
    if (!selectedProduct) return 0;

    let price = selectedProduct.price;

    // Adicionar preço dos toppings extras (além do limite grátis)
    getAllToppingCategories().forEach((category) => {
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
  }, [selectedProduct, toppingQuantities, quantity, currentSizeId]);

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
  }, [toppingQuantities, skippedCategories, wantsCutlery, currentSizeId]);

  if (!initialProduct || !selectedProduct) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Produto não encontrado</h1>
          <Button onClick={() => router.push('/')}>Voltar ao menu</Button>
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

  const handleSizeChange = (product: Product) => {
    setSelectedProductId(product.id);
    setImageError(false); // Reset image error when changing size
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
    // Criar objeto de customização com todas as seleções
    const toppingsData = TOPPINGS.map(t => ({
      id: t.id,
      name: t.name,
      price: t.price,
      category: t.category,
    }));

    const limits: Record<string, number> = {};
    getAllToppingCategories().forEach(cat => {
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
    addItem(selectedProduct, quantity, customization);

    // Mensagem de confirmação
    const selectedToppingNames = TOPPINGS
      .filter((t) => (toppingQuantities[t.id] || 0) > 0)
      .map((t) => {
        const qty = toppingQuantities[t.id];
        return qty > 1 ? `${qty}x ${t.name}` : t.name;
      })
      .join(', ');

    toast.success('Adicionado ao carrinho!', {
      description: selectedToppingNames
        ? `${selectedProduct.name} com ${selectedToppingNames}`
        : selectedProduct.name,
      duration: 2000,
    });

    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-lg truncate">{initialProduct.name}</h1>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="max-w-2xl mx-auto pb-32">
        {/* Imagem do Produto */}
        <div className="relative w-full h-64 sm:h-80 bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-900">
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Cherry className="w-24 h-24" style={{ color: '#c69abf' }} />
            </div>
          ) : (
            <Image
              src={selectedProduct.imageUrl}
              alt={selectedProduct.name}
              fill
              className="object-cover"
              priority
              onError={() => setImageError(true)}
            />
          )}
          {selectedProduct.hasPromo && selectedProduct.promoText && (
            <Badge 
              className="absolute top-4 right-4 z-10 font-semibold text-sm px-3 py-1"
              style={{ backgroundColor: '#fcc90c', color: '#430238' }}
            >
              {selectedProduct.promoText}
            </Badge>
          )}
        </div>

        {/* Info do Produto */}
        <Card className="rounded-none border-x-0 border-t-0">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {selectedProduct.name}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              {selectedProduct.description}
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              {selectedProduct.hasPromo && selectedProduct.originalPrice && (
                <span className="text-sm text-neutral-400 line-through">
                  R$ {selectedProduct.originalPrice.toFixed(2)}
                </span>
              )}
              <span 
                className="text-2xl font-bold"
                style={{ color: '#9d0094' }}
              >
                R$ {selectedProduct.price.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Seletor de Tamanho - Apenas se houver variantes */}
        {hasSizeVariants && (
          <Card className="rounded-none border-x-0 border-t-0">
            <CardHeader>
              <CardTitle>Escolha o tamanho</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-2">
              {sizeVariants.map((variant) => {
                const isSelected = selectedProductId === variant.id;
                const sizeInfo = variant.sizeId ? SIZE_LABELS[variant.sizeId] : null;

                return (
                  <button
                    key={variant.id}
                    onClick={() => handleSizeChange(variant)}
                    className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 ${isSelected ? 'border-selected' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={isSelected 
                          ? { borderColor: '#9d0094', backgroundColor: '#9d0094' }
                          : { borderColor: '#d1d5db' }
                        }
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="text-left">
                        <span className="font-medium">{sizeInfo?.name || 'Único'}</span>
                        {sizeInfo && (
                          <span className="text-neutral-500 dark:text-neutral-400 ml-2">
                            {sizeInfo.ml}ml
                          </span>
                        )}
                      </div>
                    </div>
                    <span 
                      className="font-semibold"
                      style={isSelected ? { color: '#9d0094' } : undefined}
                    >
                      R$ {variant.price.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
            </CardContent>
          </Card>
        )}

        {/* Acompanhamentos */}
        {getAllToppingCategories().map((category) => {
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
                      className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                        selectedCount >= limit
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
              className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 ${
                wantsCutlery === true ? 'border-selected-light dark:border-selected-dark' : ''
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
              className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 ${
                wantsCutlery === false ? 'border-selected-light dark:border-selected-dark' : ''
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
        <Card className="rounded-none border-x-0 border-t-0">
          <CardHeader>
            <CardTitle>Alguma observação?</CardTitle>
          </CardHeader>
          <CardContent>
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
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200/50 dark:border-neutral-800/50 shadow-lg z-50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Quantidade */}
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-muted rounded-xl p-0.5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                quantity <= 1 
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
            className="flex-1 h-12 text-white font-semibold text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#139948' }}
          >
            Adicionar • R$ {totalPrice.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
