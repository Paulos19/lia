import { prisma } from "@/lib/prisma"
import { ScheduleForm } from "@/components/schedule-form"
import { DeleteSlotButton } from "@/components/delete-slot-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function SchedulePage() {
  // Busca slots futuros ordenados
  const slots = await prisma.visitSlot.findMany({
    where: {
      date: { gte: new Date() } // Apenas datas futuras
    },
    orderBy: { date: 'asc' },
    include: { lead: true } // Traz quem agendou, se houver
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Agenda de Visitas</h2>
        <p className="text-muted-foreground">Defina quando você pode receber clientes.</p>
      </div>

      <ScheduleForm />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {slots.length === 0 ? (
          <p className="text-slate-500 col-span-3 text-center py-10">Nenhum horário disponível cadastrado.</p>
        ) : (
          slots.map((slot) => (
            <Card key={slot.id} className={slot.status === 'BOOKED' ? "border-green-500 bg-green-50" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant={slot.status === 'BOOKED' ? "default" : "outline"} className={slot.status === 'BOOKED' ? "bg-green-600" : ""}>
                    {slot.status === 'BOOKED' ? "AGENDADO" : "LIVRE"}
                  </Badge>
                  {slot.status === 'AVAILABLE' && <DeleteSlotButton id={slot.id} />}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <CalendarIcon className="h-5 w-5 text-slate-500" />
                  {format(slot.date, "dd 'de' MMMM", { locale: ptBR })}
                </div>
                <div className="flex items-center gap-2 text-slate-600 mt-1">
                  <Clock className="h-4 w-4" />
                  {format(slot.date, "HH:mm", { locale: ptBR })}
                </div>

                {slot.lead && (
                  <div className="mt-4 p-3 bg-white rounded border border-green-200 text-sm">
                    <p className="font-bold text-green-800">Cliente: {slot.lead.name}</p>
                    <p className="text-slate-500">{slot.lead.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}