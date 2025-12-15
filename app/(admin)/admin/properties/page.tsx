import { prisma } from "@/lib/prisma"
import { PropertiesTable } from "@/components/properties/properties-table"

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' }
  })

  // --- CORREÇÃO SÊNIOR ---
  // Convertendo Decimal para Number antes de passar para o Client Component
  // Isso evita o erro "Decimal objects are not supported"
  const formattedProperties = properties.map(property => ({
    ...property,
    price: Number(property.price) // O Prisma retorna Decimal, nós transformamos em number JS puro
  }))

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Imóveis</h2>
        <p className="text-slate-500">
          Gerencie seu catálogo. A Lia usa esses dados para vender por você.
        </p>
      </div>

      <PropertiesTable initialProperties={formattedProperties} />
    </div>
  )
}