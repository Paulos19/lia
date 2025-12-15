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

export async function updateProperty(id: string, formData: any) {
  // 1. Validar os dados recebidos com o mesmo schema
  const validatedFields = propertyFormSchema.safeParse(formData)

  if (!validatedFields.success) {
    return { error: "Campos inválidos. Verifique os dados." }
  }

  const { title, description, aiContext, location, price, images, features } = validatedFields.data

  // 2. Converter features (string -> array)
  const featuresArray = features 
    ? features.split(',').map(f => f.trim()).filter(f => f !== "")
    : []

  try {
    // 3. Update no banco
    await prisma.property.update({
      where: { id },
      data: {
        title,
        description,
        aiContext: aiContext || "",
        location,
        price,
        images,
        features: featuresArray,
        // Não alteramos o status aqui por segurança, ou mantemos o atual
      }
    })

    // 4. Limpar cache para refletir a mudança na lista e no dashboard
    revalidatePath('/admin/properties')
    revalidatePath(`/admin/properties/${id}/edit`)
    
  } catch (error) {
    console.error("Erro ao atualizar imóvel:", error)
    return { error: "Erro ao atualizar. O imóvel pode não existir mais." }
  }

  // 5. Redirecionar para a lista
  redirect('/admin/properties')
}

export async function deleteLead(id: string) {
  try {
    await prisma.lead.delete({ where: { id } })
    revalidatePath('/admin/leads')
    revalidatePath('/admin/dashboard') // Atualiza métricas também
    return { success: true }
  } catch (error) {
    console.error("Erro ao deletar lead:", error)
    return { error: "Erro ao excluir. O lead pode ter agendamentos vinculados." }
  }
}

export async function getLiaConfig() {
  try {
    const config = await prisma.liaConfig.findUnique({
      where: { id: "default" }
    })
    return config
  } catch (error) {
    return null
  }
}

export async function updateLiaConfig(data: { systemPrompt: string, isActive: boolean }) {
  try {
    await prisma.liaConfig.upsert({
      where: { id: "default" },
      update: {
        systemPrompt: data.systemPrompt,
        isActive: data.isActive
      },
      create: {
        id: "default",
        systemPrompt: data.systemPrompt,
        isActive: data.isActive
      }
    })
    
    revalidatePath('/admin/brain')
    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar Cérebro:", error)
    return { error: "Erro ao salvar configurações." }
  }
}