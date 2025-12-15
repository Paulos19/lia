'use client'

import { useState } from "react"
import { VisitSlot } from "@prisma/client"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Trash2, 
  User,
  AlertCircle
} from "lucide-react"
import { format, isSameDay, startOfToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"
import { createVisitSlot, deleteVisitSlot } from "@/lib/actions"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

// --- CORREÇÃO DE TIPAGEM AQUI ---
// Mudamos 'name: string' para 'name: string | null'
interface ScheduleViewProps {
  initialSlots: (VisitSlot & { 
    lead?: { 
      name: string | null, 
      phone: string 
    } | null 
  })[]
}

export function ScheduleView({ initialSlots }: ScheduleViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [newTime, setNewTime] = useState("09:00") 
  const [isCreating, setIsCreating] = useState(false)

  const selectedDaySlots = initialSlots.filter(slot => 
    date && isSameDay(new Date(slot.date), date)
  )

  selectedDaySlots.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const daysWithSlots = initialSlots.map(s => new Date(s.date))

  async function handleAddSlot() {
    if (!date || !newTime) return

    setIsCreating(true)
    
    const [hours, minutes] = newTime.split(':').map(Number)
    const slotDate = new Date(date)
    slotDate.setHours(hours, minutes, 0, 0)

    const result = await createVisitSlot(slotDate)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Horário liberado!")
    }
    setIsCreating(false)
  }

  async function handleDelete(id: string) {
    const result = await deleteVisitSlot(id)
    if (result?.error) toast.error("Erro ao excluir")
    else toast.success("Horário removido")
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-200px)] min-h-[600px]">
      
      <div className="flex flex-col gap-6 lg:w-96 shrink-0">
        <Card className="border-slate-100 shadow-md">
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border-0 w-full flex justify-center pb-4"
              modifiers={{ hasSlots: daysWithSlots }}
              modifiersStyles={{
                hasSlots: { 
                    fontWeight: 'bold', 
                    textDecoration: 'underline',
                    textDecorationColor: '#6366f1',
                    textUnderlineOffset: '4px'
                }
              }}
              disabled={(date) => date < startOfToday()}
            />
          </CardContent>
        </Card>

        <Card className="bg-indigo-50 border-indigo-100">
          <CardContent className="p-4 flex items-start gap-3">
             <AlertCircle className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
             <div className="text-sm text-indigo-900">
               <p className="font-semibold mb-1">Dica Pro:</p>
               <p>Selecione um dia no calendário para gerenciar seus horários. Dias sublinhados já têm disponibilidade cadastrada.</p>
             </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1 border-slate-100 shadow-sm flex flex-col overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                {date ? format(date, "EEEE, d 'de' MMMM", { locale: ptBR }) : "Selecione uma data"}
              </CardTitle>
              <CardDescription>
                Gerencie sua disponibilidade para visitas neste dia.
              </CardDescription>
            </div>
            
            {date && (
               <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                 <Clock className="h-4 w-4 text-slate-400 ml-2" />
                 <Input 
                   type="time" 
                   value={newTime}
                   onChange={(e) => setNewTime(e.target.value)}
                   className="h-8 w-24 border-0 focus-visible:ring-0 p-0 text-sm"
                 />
                 <Button size="sm" onClick={handleAddSlot} disabled={isCreating} className="bg-indigo-600 hover:bg-indigo-700 h-8">
                   {isCreating ? <Plus className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                   Adicionar
                 </Button>
               </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 relative overflow-y-auto">
           {!date ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400">
               <CalendarIcon className="h-16 w-16 mb-4 opacity-20" />
               <p>Selecione uma data para ver os horários</p>
             </div>
           ) : selectedDaySlots.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
               <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                 <Clock className="h-6 w-6 text-slate-300" />
               </div>
               <p className="font-medium text-slate-600">Dia livre (sem horários)</p>
               <p className="text-sm">Adicione horários acima para a Lia poder agendar visitas.</p>
             </div>
           ) : (
             <div className="divide-y divide-slate-100">
               <AnimatePresence mode="popLayout">
                 {selectedDaySlots.map((slot) => (
                   <motion.div
                     key={slot.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, height: 0, padding: 0 }}
                     className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                   >
                     <div className="flex items-center gap-4">
                       <div className="bg-white border border-slate-200 rounded-lg p-2.5 min-w-[80px] text-center shadow-sm">
                         <span className="text-lg font-bold text-slate-900 block leading-none">
                           {format(new Date(slot.date), "HH:mm")}
                         </span>
                       </div>
                       
                       <div>
                         {slot.status === 'BOOKED' && slot.lead ? (
                           <div>
                             <div className="flex items-center gap-2 mb-1">
                               <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
                                 AGENDADO
                               </Badge>
                               <span className="text-xs text-slate-400">Visita Confirmada</span>
                             </div>
                             <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                               <User className="h-3.5 w-3.5 text-slate-500" />
                               {/* Adicionamos um fallback caso venha null */}
                               {slot.lead.name || "Cliente sem nome"}
                             </div>
                             <p className="text-xs text-slate-500 pl-5.5">{slot.lead.phone}</p>
                           </div>
                         ) : (
                            <div>
                              <Badge variant="outline" className="text-slate-500 font-normal mb-1">
                                Disponível
                              </Badge>
                              <p className="text-sm text-slate-500">Aguardando agendamento pela Lia</p>
                            </div>
                         )}
                       </div>
                     </div>

                     {slot.status === 'AVAILABLE' && (
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => handleDelete(slot.id)}
                         className="text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     )}
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  )
}