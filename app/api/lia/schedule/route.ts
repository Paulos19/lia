// app/api/lia/schedule/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { slotId, phone, name, email } = body

    if (!slotId || !phone) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // 1. Atualiza/Cria o Lead com os dados novos (Email/Nome)
    // Usamos o telefone como chave única
    const lead = await prisma.lead.upsert({
      where: { phone },
      update: {
        name: name || undefined,
        interestLevel: 'SCHEDULED', // Já marca como Agendado/Quente
        // Se você tivesse campo email no Lead, salvaria aqui. 
        // Como não pusemos no schema inicial, vou salvar no notes por enquanto ou você pode adicionar o campo email no schema depois.
        notes: email ? `Email informado: ${email}` : undefined
      },
      create: {
        phone,
        name: name || "Cliente do Agendamento",
        interestLevel: 'SCHEDULED',
        notes: email ? `Email informado: ${email}` : undefined
      }
    })

    // 2. Tenta reservar o slot
    // Verifica se ainda está livre (concorrência)
    const slot = await prisma.visitSlot.findUnique({ where: { id: slotId } })
    
    if (!slot || slot.status !== 'AVAILABLE') {
      return NextResponse.json({ error: "Este horário acabou de ser reservado por outra pessoa." }, { status: 409 })
    }

    // 3. Efetiva o agendamento
    await prisma.visitSlot.update({
      where: { id: slotId },
      data: {
        status: 'BOOKED',
        leadId: lead.id
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Agendamento realizado com sucesso",
      data: {
        data_visita: slot.date,
        cliente: lead.name
      }
    })

  } catch (error) {
    console.error("Erro no agendamento:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}