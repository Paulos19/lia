// app/api/lia/lead/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { InterestLevel } from "@prisma/client"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (!body.phone) {
      return NextResponse.json({ error: "Telefone é obrigatório" }, { status: 400 })
    }

    // 1. Tratamento de Enum (InterestLevel)
    let safeInterest: InterestLevel | undefined = undefined; // Começa undefined
    if (body.interestLevel) {
      const levelUpper = body.interestLevel.toUpperCase()
      if (['COLD', 'WARM', 'HOT', 'SCHEDULED'].includes(levelUpper)) {
        safeInterest = levelUpper as InterestLevel
      }
    }

    // 2. Lógica de Proteção de Dados
    // Se for o Agente falando (isAgent = true), nós NÃO queremos sobrescrever o nome do cliente
    // nem mudar a classificação, apenas registrar que houve contato.
    const isAgent = body.isAgent === true;

    // Dados que serão atualizados (Update)
    const updateData: any = {
      lastContact: new Date(), // Sempre atualiza a data
      // Se tiver notas novas da IA, adiciona/substitui
      notes: body.notes || undefined 
    }

    // Só atualiza Nome e Interesse se for o CLIENTE falando
    if (!isAgent) {
      if (body.name) updateData.name = body.name;
      if (safeInterest) updateData.interestLevel = safeInterest;
    }

    const lead = await prisma.lead.upsert({
      where: { phone: body.phone },
      update: updateData, // Usa o objeto filtrado acima
      create: {
        phone: body.phone,
        // No Create, precisamos de um nome inicial.
        // Se foi o agente que iniciou a conversa (prospecção), usamos "Lead Novo".
        // Se foi o cliente, usamos o nome dele.
        name: !isAgent ? (body.name || "Desconhecido") : "Novo Lead (Prospecção)",
        interestLevel: safeInterest || 'COLD',
        notes: body.notes || "Primeiro contato"
      }
    })

    return NextResponse.json({ success: true, leadId: lead.id })

  } catch (error) {
    console.error("❌ ERRO AO SALVAR LEAD:", error)
    return NextResponse.json({ error: "Erro interno", details: String(error) }, { status: 500 })
  }
}