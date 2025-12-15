import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { PropertyForm } from "@/components/properties/property-form"

interface EditPropertyPageProps {
  // No Next.js 15+, params é uma Promise
  params: Promise<{
    id: string
  }>
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  // 1. Aguardamos a resolução dos parâmetros
  const { id } = await params

  // 2. Buscamos o imóvel
  const property = await prisma.property.findUnique({
    where: { id }
  })

  if (!property) {
    notFound()
  }

  // 3. Serializamos os dados (Decimal -> Number) para o Client Component não quebrar
  const serializedProperty = {
    ...property,
    price: Number(property.price)
  }

  // Renderiza o formulário passando os dados tratados
  return <PropertyForm initialData={serializedProperty} />
}