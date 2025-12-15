// auth.config.ts
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login', // Redireciona para cá se não estiver logado
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');

      if (isOnAdmin) {
        if (isLoggedIn) return true;
        return false; // Redireciona para login
      }
      
      // Se estiver logado e for para o login, manda pro dashboard
      if (isLoggedIn && nextUrl.pathname.startsWith('/login')) {
        return Response.redirect(new URL('/admin/dashboard', nextUrl));
      }
      
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.role) {
        // @ts-ignore
        session.user.role = token.role;
      }
      return session;
    },
  },
  providers: [], // Configurado no auth.ts
} satisfies NextAuthConfig;