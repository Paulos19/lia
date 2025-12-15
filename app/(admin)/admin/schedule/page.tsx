import { prisma } from "@/lib/prisma"
import { ScheduleView } from "@/components/schedule/schedule-view"

export const dynamic = 'force-dynamic' // Garante que não faça cache estático da agenda

export default async function SchedulePage() {
  // Busca TODOS os slots futuros (ou uma janela grande, ex: 3 meses)
  // Para a UX ser fluida, trazemos tudo e filtramos no cliente por data.
  // Em apps gigantes, faríamos busca por mês, mas para < 1000 slots isso é instantâneo.
  const slots = await prisma.visitSlot.findMany({
    where: {
      date: { 
        gte: new Date(new Date().setHours(0,0,0,0)) // A partir de hoje 00:00
      }
    },
    include: {
      lead: {
        select: { name: true, phone: true }
      }
    },
    orderBy: { date: 'asc' }
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Agenda de Visitas</h2>
        <p className="text-slate-500">
          Gerencie quando você pode receber clientes. A Lia só agendará nestes horários.
        </p>
      </div>

      <ScheduleView initialSlots={slots} />
    </div>
  )
}