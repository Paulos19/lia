// auth.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    return user;
  } catch (error) {
    console.error('Erro ao buscar user:', error);
    throw new Error('Falha ao buscar usuário.');
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // 1. Valida os dados de entrada
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          // 2. Busca o usuário no banco
          const user = await getUser(email);

          if (!user) return null;

          // 3. Verifica a senha
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            // Retorna o objeto do usuário (incluindo a role)
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role, 
            };
          }
        }
        
        console.log('Credenciais inválidas');
        return null;
      },
    }),
  ],
});