import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Users, Flame, ArrowRight, Plus } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

// Essa página é um Server Component, então podemos buscar dados do banco diretamente
export default async function DashboardPage() {
  
  // 1. Buscando métricas principais em paralelo (para ser rápido)
  const [
    totalProperties, 
    totalLeads, 
    hotLeadsCount, 
    recentLeads
  ] = await Promise.all([
    prisma.property.count({ where: { status: 'AVAILABLE' } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { interestLevel: 'HOT' } }),
    prisma.lead.findMany({
      take: 5,
      orderBy: { lastContact: 'desc' },
    })
  ])

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral da sua imobiliária digital.</p>
        </div>
        <div className="flex gap-2">
           <Link href="/admin/properties/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Imóvel
            </Button>
           </Link>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Card 1: Imóveis Disponíveis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imóveis Ativos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties}</div>
            <p className="text-xs text-muted-foreground">Disponíveis para venda/aluguel</p>
          </CardContent>
        </Card>

        {/* Card 2: Leads Quentes (Prioridade) */}
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Leads Quentes 🔥</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{hotLeadsCount}</div>
            <p className="text-xs text-orange-600/80">Clientes prontos para fechar</p>
          </CardContent>
        </Card>

        {/* Card 3: Total de Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base de Contatos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">Total de conversas iniciadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Leads Recentes */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Últimas Conversas da Lia</CardTitle>
            <Link href="/admin/leads" className="text-sm text-blue-600 hover:underline flex items-center">
              Ver todos <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <p>Nenhum lead capturado ainda.</p>
                <p className="text-sm">Conecte o WhatsApp para começar.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Interação</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="font-medium">{lead.name || "Desconhecido"}</div>
                        <div className="text-xs text-muted-foreground">{lead.phone}</div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={lead.interestLevel} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(lead.lastContact), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                           <Link href={`https://wa.me/${lead.phone}`} target="_blank">
                             Abrir Whats
                           </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Pequeno componente auxiliar para colorir as tags de status
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    HOT: "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200",
    WARM: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200",
    COLD: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200",
    SCHEDULED: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200",
  }

  const label: Record<string, string> = {
    HOT: "Quente 🔥",
    WARM: "Morno 🤔",
    COLD: "Frio ❄️",
    SCHEDULED: "Agendado 📅",
  }

  return (
    <Badge variant="outline" className={styles[status] || styles.COLD}>
      {label[status] || status}
    </Badge>
  )
}