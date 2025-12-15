'use client'

import { createVisitSlot } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Loader2, Plus } from "lucide-react"

export function ScheduleForm() {
  const [date, setDate] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date) return

    setIsSaving(true)
    // Converte string input datetime-local para Date object
    const dateObj = new Date(date)
    
    await createVisitSlot(dateObj)
    
    setIsSaving(false)
    setDate("") // Limpa
    // A action dá revalidatePath, então a lista embaixo atualiza sozinha
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 items-end mb-8 bg-white p-4 rounded-lg border shadow-sm">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <label htmlFor="date" className="text-sm font-medium text-slate-700">Nova Disponibilidade</label>
        <Input 
          id="date" 
          type="datetime-local" 
          value={date} 
          onChange={(e) => setDate(e.target.value)}
          className="w-full"
        />
      </div>
      <Button type="submit" disabled={isSaving || !date}>
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
        Adicionar Horário
      </Button>
    </form>
  )
}