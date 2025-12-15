import { prisma } from "@/lib/prisma"
import { LeadsTable } from "@/components/leads/leads-table"

export const dynamic = 'force-dynamic' // Garante dados frescos

export default async function LeadsPage() {
  // Busca Leads ordenados pelo contato mais recente
  const leads = await prisma.lead.findMany({
    orderBy: { lastContact: 'desc' }
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Leads</h2>
        <p className="text-slate-500">
          Acompanhe quem está conversando com a Lia e identifique as melhores oportunidades.
        </p>
      </div>

      <LeadsTable initialLeads={leads} />
    </div>
  )
}