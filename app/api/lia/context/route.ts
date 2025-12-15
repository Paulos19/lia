// app/api/lia/context/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Forçamos a rota a ser dinâmica para não fazer cache estático
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  try {
    // Se não houver termo de busca, traz os últimos 5 imóveis (destaques)
    // Se houver query, faz uma busca ampla
    const properties = await prisma.property.findMany({
      where: {
        status: 'AVAILABLE', // A Lia só mostra o que está disponível
        ...(query ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } },
            { aiContext: { contains: query, mode: 'insensitive' } }, // O Pulo do Gato: Busca nos detalhes ocultos
            { features: { hasSome: [query] } } // Busca nas tags (ex: Piscina)
          ]
        } : {})
      },
      take: 5, // Limita a 5 resultados para não estourar o contexto da IA
      orderBy: { createdAt: 'desc' }
    })

    // Otimização para IA: Retornamos um JSON limpo e em Português
    // Isso economiza tokens e ajuda a IA a entender melhor os campos
    const formattedData = properties.map(p => ({
      id: p.id,
      titulo: p.title,
      preco: Number(p.price),
      localizacao: p.location,
      // Concatenamos a descrição pública com o contexto da IA para o "conhecimento" do agente
      detalhes_completos: `Descrição: ${p.description}\n\nDetalhes Internos (Use com sabedoria): ${p.aiContext || "Sem dados extras."}`,
      caracteristicas: p.features.join(", "),
      imagem_capa: p.images[0] || null
    }))

    return NextResponse.json(formattedData)
    
  } catch (error) {
    console.error("Erro na API da Lia:", error)
    return NextResponse.json({ error: "Erro interno ao buscar imóveis" }, { status: 500 })
  }
}