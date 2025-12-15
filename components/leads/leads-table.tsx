'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lead } from "@prisma/client"
import { 
  Search, 
  Trash2, 
  MessageSquare, 
  Phone, 
  Calendar,
  Filter,
  User
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteLead } from "@/lib/actions"
import { toast } from "sonner"

interface LeadsTableProps {
  initialLeads: Lead[]
}

export function LeadsTable({ initialLeads }: LeadsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>(['HOT', 'SCHEDULED', 'WARM', 'COLD'])
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Filtro Combinado (Texto + Status)
  const filteredLeads = initialLeads.filter(lead => {
    const matchesSearch = 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lead.phone.includes(searchTerm)
    
    const matchesStatus = statusFilter.includes(lead.interestLevel)

    return matchesSearch && matchesStatus
  })

  async function handleDelete(id: string) {
    if(!confirm("Tem certeza? O histórico de conversa será perdido.")) return

    setIsDeleting(id)
    const result = await deleteLead(id)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Lead removido com sucesso")
    }
    setIsDeleting(null)
  }

  // Função para abrir o WhatsApp Web
  function openWhatsapp(phone: string) {
    const cleanPhone = phone.replace(/\D/g, '')
    window.open(`https://wa.me/${cleanPhone}`, '_blank')
  }

  return (
    <div className="space-y-4">
      {/* Barra de Ferramentas */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        
        {/* Busca */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por nome ou telefone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-slate-200 focus-visible:ring-indigo-500"
          />
        </div>

        {/* Filtro de Status */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto border-slate-200 text-slate-700">
              <Filter className="mr-2 h-4 w-4" /> 
              Filtrar Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Exibir Leads</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={statusFilter.includes('SCHEDULED')}
              onCheckedChange={(checked) => {
                setStatusFilter(prev => checked ? [...prev, 'SCHEDULED'] : prev.filter(s => s !== 'SCHEDULED'))
              }}
              className="text-green-700 font-medium"
            >
              Agendados 📅
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter.includes('HOT')}
              onCheckedChange={(checked) => {
                setStatusFilter(prev => checked ? [...prev, 'HOT'] : prev.filter(s => s !== 'HOT'))
              }}
              className="text-orange-600 font-medium"
            >
              Quentes 🔥
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter.includes('WARM')}
              onCheckedChange={(checked) => {
                setStatusFilter(prev => checked ? [...prev, 'WARM'] : prev.filter(s => s !== 'WARM'))
              }}
              className="text-yellow-600 font-medium"
            >
              Mornos ☀️
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter.includes('COLD')}
              onCheckedChange={(checked) => {
                setStatusFilter(prev => checked ? [...prev, 'COLD'] : prev.filter(s => s !== 'COLD'))
              }}
              className="text-slate-500 font-medium"
            >
              Frios ❄️
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabela de Leads */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <User className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Nenhum lead encontrado</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              Aguarde a Lia captar novos contatos ou ajuste seus filtros de busca.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Interesse</th>
                  <th className="px-6 py-4">Última Interação</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredLeads.map((lead, index) => (
                    <motion.tr 
                      key={lead.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                            {lead.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 truncate max-w-[180px]">
                                {lead.name}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                <Phone size={10} /> {lead.phone}
                            </div>
                          </div>
                        </div>
                        {/* Notas Rápidas (Exibe se tiver) */}
                        {lead.notes && (
                            <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2 max-w-[250px]">
                                📝 {lead.notes}
                            </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <StatusBadge status={lead.interestLevel} />
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatDistanceToNow(new Date(lead.lastContact), { locale: ptBR, addSuffix: true })}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 h-8"
                             onClick={() => openWhatsapp(lead.phone)}
                            >
                             <MessageSquare className="h-4 w-4 mr-1" /> Conversar
                           </Button>
                           
                           <Button 
                             size="icon" 
                             variant="ghost" 
                             className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50"
                             onClick={() => handleDelete(lead.id)}
                             disabled={isDeleting === lead.id}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    HOT: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100",
    WARM: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
    COLD: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100",
    SCHEDULED: "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",
  }
  
  const labels: Record<string, string> = {
    HOT: "🔥 Quente",
    WARM: "☀️ Morno",
    COLD: "❄️ Frio",
    SCHEDULED: "📅 Agendado"
  }

  return (
    <Badge variant="outline" className={`font-medium ${styles[status] || styles.COLD}`}>
      {labels[status] || status}
    </Badge>
  )
}