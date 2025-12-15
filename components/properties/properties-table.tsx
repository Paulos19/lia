'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Property } from "@prisma/client" // Importamos para usar de base
import Link from "next/link"
import Image from "next/image"
import { 
  Search, MapPin, Plus, MoreHorizontal, Pencil, Building2
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeletePropertyButton } from "@/components/delete-property-button"

// --- CORREÇÃO DE TIPAGEM ---
// Criamos um tipo derivado onde 'price' é number, não Decimal
type SerializedProperty = Omit<Property, 'price'> & { price: number }

interface PropertiesTableProps {
  initialProperties: SerializedProperty[]
}

export function PropertiesTable({ initialProperties }: PropertiesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProperties = initialProperties.filter(property => 
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Barra de Ferramentas */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por título ou localização..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-slate-200 focus-visible:ring-indigo-500"
          />
        </div>
        <Link href="/admin/properties/new">
          <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" /> Novo Imóvel
          </Button>
        </Link>
      </div>

      {/* Lista / Tabela */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <Building2 className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Nenhum imóvel encontrado</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1 mb-4">
              {searchTerm ? "Tente buscar por outro termo." : "Comece cadastrando o primeiro imóvel do seu portfólio."}
            </p>
            {!searchTerm && (
              <Link href="/admin/properties/new">
                <Button variant="outline">Cadastrar Imóvel</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Imóvel</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Preço</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredProperties.map((property, index) => (
                    <motion.tr 
                      key={property.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                            {property.images[0] ? (
                              <Image 
                                src={property.images[0]} 
                                alt={property.title} 
                                fill 
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <Building2 size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 line-clamp-1">{property.title}</div>
                            <div className="flex items-center text-slate-500 mt-1">
                              <MapPin size={12} className="mr-1" />
                              <span className="truncate max-w-[200px]">{property.location}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <StatusBadge status={property.status} />
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-700">
                        {/* Agora property.price já é number, não precisa converter */}
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600">
                              <span className="sr-only">Menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/properties/${property.id}/edit`} className="cursor-pointer">
                                <Pencil className="mr-2 h-3.5 w-3.5" /> Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <div className="p-1">
                               <DeletePropertyButton id={property.id} title={property.title} />
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
    AVAILABLE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    SOLD: "bg-slate-100 text-slate-600 border-slate-200 line-through decoration-slate-400",
    RENTED: "bg-blue-100 text-blue-700 border-blue-200",
    RESERVED: "bg-amber-100 text-amber-700 border-amber-200",
  }
  
  const labels: Record<string, string> = {
    AVAILABLE: "Disponível",
    SOLD: "Vendido",
    RENTED: "Alugado",
    RESERVED: "Reservado"
  }

  return (
    <Badge variant="outline" className={`font-normal ${styles[status] || styles.AVAILABLE}`}>
      {labels[status] || status}
    </Badge>
  )
}