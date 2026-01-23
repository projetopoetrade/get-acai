// middleware.ts
// Middleware do Next.js para proteção de rotas
// Este arquivo DEVE estar na raiz do projeto (mesmo nível que src/)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que requerem autenticação
const protectedRoutes = ['/pedidos', '/perfil', '/checkout'];

// Rotas que redirecionam para home se já estiver autenticado
const authRoutes = ['/login', '/cadastro'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar se há token no cookie (quando implementar cookies httpOnly)
  // Por enquanto, verificamos no localStorage via cliente
  const token = request.cookies.get('auth_token')?.value;

  // Se a rota é protegida e não há token, redirecionar para login
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Se já está autenticado e tenta acessar login/cadastro, redirecionar para home
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
