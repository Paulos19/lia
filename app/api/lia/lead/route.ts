// app/api/lia/lead/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { InterestLevel } from "@prisma/client"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Log para debug no terminal do VSCode
    console.log("📥 Recebido no Endpoint de Lead:", body)

    if (!body.phone) {
      return NextResponse.json({ error: "Telefone é obrigatório" }, { status: 400 })
    }

    // --- TRATAMENTO DE ENUM (A BLINDAGEM) ---
    // A IA pode mandar "Hot", "hot", "Quente"... vamos normalizar.
    let safeInterest: InterestLevel = 'COLD' // Padrão
    
    if (body.interestLevel) {
      const levelUpper = body.interestLevel.toUpperCase()
      
      // Verifica se é um valor válido do Enum
      if (['COLD', 'WARM', 'HOT', 'SCHEDULED'].includes(levelUpper)) {
        safeInterest = levelUpper as InterestLevel
      }
    }
    // ----------------------------------------

    const lead = await prisma.lead.upsert({
      where: { phone: body.phone },
      update: {
        lastContact: new Date(),
        name: body.name || undefined,
        interestLevel: safeInterest, // Usa o valor tratado
        notes: body.notes || undefined
      },
      create: {
        phone: body.phone,
        name: body.name || "Desconhecido",
        interestLevel: safeInterest, // Usa o valor tratado
        notes: body.notes || "Primeiro contato via Lia"
      }
    })

    return NextResponse.json({ success: true, leadId: lead.id })

  } catch (error) {
    // Agora veremos o erro real no terminal
    console.error("❌ ERRO FATAL AO SALVAR LEAD:", error)
    // Retorna o erro detalhado para o n8n ver
    return NextResponse.json({ 
      error: "Erro interno no servidor", 
      details: String(error) 
    }, { status: 500 })
  }
}