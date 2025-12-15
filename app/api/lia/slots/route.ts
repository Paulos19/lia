// app/api/lia/slots/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const slots = await prisma.visitSlot.findMany({
      where: {
        status: 'AVAILABLE',
        date: { gte: new Date() } // Apenas futuros
      },
      orderBy: { date: 'asc' },
      take: 5 // Mostra só os próximos 5 para não poluir o chat
    })

    if (slots.length === 0) {
      return NextResponse.json([])
    }

    // Formatamos para a IA entender fácil
    const formattedSlots = slots.map(slot => ({
      id: slot.id,
      texto_legivel: format(slot.date, "EEEE, dd/MM 'às' HH:mm", { locale: ptBR }), // "Segunda-feira, 20/12 às 14:00"
      iso: slot.date.toISOString()
    }))

    return NextResponse.json(formattedSlots)

  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar slots" }, { status: 500 })
  }
}