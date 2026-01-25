This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 🔧 Configurações de Desenvolvimento

### Modo de Desenvolvimento (Loja Sempre Aberta)

Para evitar que a loja feche automaticamente durante o desenvolvimento, adicione no arquivo `.env.local`:

```env
NEXT_PUBLIC_DEV_MODE=true
```

Quando ativado, a loja ficará sempre aberta, ignorando a verificação de horário do backend. Você verá uma mensagem no console: `🔧 [DEV MODE] Loja forçada a ficar sempre aberta`.

**⚠️ Importante:** Não deixe essa variável como `true` em produção!

### Fuso Horário

O sistema usa o fuso horário do servidor backend para determinar se a loja está aberta ou fechada. A verificação de horário é feita no endpoint `/settings/status` do backend.

**Para verificar/alterar o fuso horário:**
- O backend provavelmente está usando UTC ou `America/Sao_Paulo` (GMT-3)
- Verifique a configuração de timezone do servidor backend
- Os horários de abertura/fechamento configurados em `/admin/configuracoes` devem estar no mesmo fuso horário do servidor

**Exemplo:** Se o servidor está em UTC e você configura "22:00" como horário de fechamento, a loja fechará às 22:00 UTC (19:00 em Brasília, se estiver em horário padrão).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
