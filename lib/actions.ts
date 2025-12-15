// lib/actions.ts
'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { propertyFormSchema } from './schemas';
import { prisma } from './prisma';

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

export async function createProperty(formData: any) {
  // 1. Validar no servidor
  const validatedFields = propertyFormSchema.safeParse(formData)

  if (!validatedFields.success) {
    return { error: "Campos inválidos. Verifique os dados." }
  }

  const { title, description, aiContext, location, price, images, features } = validatedFields.data

  // 2. Converter features (string "piscina, garagem" -> array ["piscina", "garagem"])
  const featuresArray = features 
    ? features.split(',').map(f => f.trim()).filter(f => f !== "")
    : []

  try {
    // 3. Salvar no banco
    await prisma.property.create({
      data: {
        title,
        description,
        aiContext: aiContext || "", // Garante string vazia se for null
        location,
        price,
        images,
        features: featuresArray,
        status: "AVAILABLE"
      }
    })

    // 4. Limpar cache e redirecionar
    revalidatePath('/admin/properties')
  } catch (error) {
    console.error("Erro ao criar imóvel:", error)
    return { error: "Erro de banco de dados ao salvar imóvel." }
  }

  // O redirect deve ficar fora do try/catch no Next.js
  redirect('/admin/properties')
}

export async function deleteProperty(id: string) {
  try {
    await prisma.property.delete({
      where: { id },
    })
    
    // Atualiza a lista instantaneamente
    revalidatePath('/admin/properties')
    return { success: true }
  } catch (error) {
    console.error("Erro ao deletar imóvel:", error)
    return { error: "Não foi possível excluir o imóvel." }
  }
}

export async function createVisitSlot(date: Date) {
  try {
    await prisma.visitSlot.create({
      data: {
        date: date,
        status: 'AVAILABLE'
      }
    })
    revalidatePath('/admin/schedule')
    return { success: true }
  } catch (error) {
    console.error("Erro ao criar slot:", error)
    return { error: "Erro ao criar horário." }
  }
}

export async function deleteVisitSlot(id: string) {
  try {
    await prisma.visitSlot.delete({ where: { id } })
    revalidatePath('/admin/schedule')
    return { success: true }
  } catch (error) {
    return { error: "Erro ao excluir." }
  }
}