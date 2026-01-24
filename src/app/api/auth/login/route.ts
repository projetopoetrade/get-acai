// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.json();

  // URL do Backend NestJS
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  try {
    const res = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ message: data.message }, { status: res.status });
    }

    // Pega o token (pode vir como access_token ou token)
    const token = data.access_token || data.token;

    // 1. Define Cookie HttpOnly (Para o Middleware/Servidor)
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    });

    // 2. Retorna o token no JSON (Para o Axios/Frontend)
    return NextResponse.json({ 
      success: true, 
      token: token, // <--- IMPORTANTE: Retornar o token aqui
      user: data.user 
    });

  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}