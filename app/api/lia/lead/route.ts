// app/api/lia/lead/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (!body.phone) {
      return NextResponse.json({ error: "Telefone é obrigatório" }, { status: 400 })
    }

    // Upsert: Cria se não existe, Atualiza se já existe
    const lead = await prisma.lead.upsert({
      where: { phone: body.phone },
      update: {
        lastContact: new Date(),
        name: body.name || undefined, // Só atualiza se vier nome novo
        interestLevel: body.interestLevel || undefined, // Ex: HOT, COLD
        notes: body.notes ? body.notes : undefined // A IA pode mandar um resumo
      },
      create: {
        phone: body.phone,
        name: body.name || "Desconhecido",
        interestLevel: body.interestLevel || "COLD",
        notes: body.notes || "Primeiro contato via Lia"
      }
    })

    return NextResponse.json({ success: true, leadId: lead.id })

  } catch (error) {
    console.error("Erro ao salvar Lead:", error)
    return NextResponse.json({ error: "Erro ao processar Lead" }, { status: 500 })
  }
}