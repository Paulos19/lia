// middleware.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // O matcher define quais rotas o middleware deve "observar"
  // Excluimos arquivos estáticos e imagens
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};