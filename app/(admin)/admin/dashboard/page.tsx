import { prisma } from "@/lib/prisma"
import { MetricCard } from "@/components/dashboard/metric-card"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { Building2, Users, Flame, CalendarCheck, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function DashboardPage() {
  const [
    totalProperties, 
    totalLeads, 
    hotLeadsCount, 
    scheduledCount,
    recentLeads
  ] = await Promise.all([
    prisma.property.count({ where: { status: 'AVAILABLE' } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { interestLevel: 'HOT' } }),
    prisma.lead.count({ where: { interestLevel: 'SCHEDULED' } }),
    prisma.lead.findMany({
      take: 6,
      orderBy: { lastContact: 'desc' },
    })
  ])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {greeting}, Neusilene! 👋
          </h2>
          <p className="text-slate-500 mt-1">
            Aqui está o resumo da operação da Lia hoje.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200">
             Baixar Relatório
           </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          index={0}
          title="Imóveis Ativos" 
          value={totalProperties} 
          description="Disponíveis no catálogo" 
          // CORREÇÃO: Passando o componente renderizado com a classe
          icon={<Building2 className="h-4 w-4" />}
          trend="neutral"
        />
        <MetricCard 
          index={1}
          title="Leads Totais" 
          value={totalLeads} 
          description="Base de contatos" 
          icon={<Users className="h-4 w-4" />}
          trend="up"
        />
        <MetricCard 
          index={2}
          title="Oportunidades" 
          value={hotLeadsCount} 
          description="Leads Quentes 🔥" 
          icon={<Flame className="h-4 w-4" />}
          trend="up"
        />
         <MetricCard 
          index={3}
          title="Agendamentos" 
          value={scheduledCount} 
          description="Visitas confirmadas" 
          icon={<CalendarCheck className="h-4 w-4" />}
          trend="up"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        <OverviewChart />

        <div className="col-span-3">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Últimas Interações</h3>
              <Link href="/admin/leads" className="text-xs text-indigo-600 font-medium hover:underline flex items-center">
                Ver tudo <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
            <div className="p-0">
              {recentLeads.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Nenhuma conversa recente.
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                      <Avatar className="h-9 w-9 border border-indigo-100">
                        <AvatarFallback className="bg-indigo-50 text-indigo-600 text-xs font-bold">
                          {lead.name ? lead.name.substring(0, 2).toUpperCase() : "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{lead.name}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {lead.notes || "Sem observações..."}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          lead.interestLevel === 'HOT' ? 'bg-orange-100 text-orange-700' :
                          lead.interestLevel === 'SCHEDULED' ? 'bg-green-100 text-green-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {lead.interestLevel}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {formatDistanceToNow(new Date(lead.lastContact), { locale: ptBR, addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}