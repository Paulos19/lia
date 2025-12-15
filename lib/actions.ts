// lib/actions.ts
'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function login(data: any) {
  try {
    await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false, // Importante para tratarmos o erro no client
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Credenciais inválidas.' };
        default:
          return { error: 'Algo deu errado.' };
      }
    }
    throw error;
  }
}