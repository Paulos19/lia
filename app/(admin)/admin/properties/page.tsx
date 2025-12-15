import { prisma } from "@/lib/prisma"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { DeletePropertyButton } from "@/components/delete-property-button"

export default async function PropertiesPage() {
  // Busca os imóveis ordenados pelos mais novos
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Imóveis</h2>
          <p className="text-muted-foreground">Gerencie o catálogo que a Lia utiliza.</p>
        </div>
        <Link href="/admin/properties/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo Imóvel
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Foto</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum imóvel cadastrado. Cadastre o primeiro acima!
                </TableCell>
              </TableRow>
            ) : (
              properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    {property.images[0] ? (
                      <div className="relative h-16 w-24 overflow-hidden rounded-md border">
                        <Image 
                          src={property.images[0]} 
                          alt={property.title} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-24 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-400">
                        Sem foto
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {property.title}
                    <div className="text-xs text-slate-500 truncate max-w-[200px]">
                      {property.description.substring(0, 50)}...
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-slate-600">
                      <MapPin className="mr-1 h-3 w-3" />
                      {property.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(property.price))}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={property.status} />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {/* Botão Editar (Apenas visual por enquanto) */}
                    <Link href={`/admin/properties/${property.id}/edit`}>
                        <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                    </Link>
                    
                    {/* Botão Excluir */}
                    <DeletePropertyButton id={property.id} title={property.title} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-700 hover:bg-green-200",
    SOLD: "bg-red-100 text-red-700 hover:bg-red-200",
    RENTED: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    RESERVED: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  }
  
  const labels: Record<string, string> = {
    AVAILABLE: "Disponível",
    SOLD: "Vendido",
    RENTED: "Alugado",
    RESERVED: "Reservado"
  }

  return <Badge className={styles[status]}>{labels[status] || status}</Badge>
}