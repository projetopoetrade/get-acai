# ⚡ Contexto Rápido - GetAçaí Frontend

## Stack
- Next.js 16 + React 19 + TypeScript
- Zustand (carrinho) + Axios (HTTP)
- Tailwind CSS + Radix UI
- Zod (validação) + React Hook Form

## Estado Atual
✅ **Integrado:** Homepage, Carrinho, Checkout, Pedidos, Página de Produto  
⚠️ **Pendente:** Cálculo de frete dinâmico, Config da loja no header

## Estrutura
- `src/services/` - Serviços de API (products, toppings, orders, coupons, etc.)
- `src/app/` - Páginas (App Router)
- `src/components/` - Componentes React
- `src/hooks/` - Custom hooks (useCart, useAuth)
- `src/lib/` - Utilitários (api.ts, auth.ts, validations.ts)

## Problemas Conhecidos
1. `availableOnly` - Filtramos no frontend (backend espera boolean, query vem como string)
2. Preços podem vir como string - Convertemos automaticamente
3. Token em localStorage mas auth usa cookie - Funciona, mas pode precisar ajuste

## Próximos Passos
1. Integrar `deliveryService.calculate()` no checkout quando CEP mudar
2. Integrar `storeService.getConfig()` no header para WhatsApp/status
3. Testar fluxo completo com backend real

## Config
- API URL: `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- Autenticação: JWT via cookie + localStorage (interceptor)

## Documentação Completa
Ver `PROJECT_CONTEXT.md` para detalhes completos.
