'use client'

import { deleteProperty } from "@/lib/actions"
import { Trash2, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner" // Usando sonner se tiver, ou alert nativo

export function DeletePropertyButton({ id, title }: { id: string, title: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault() // Previne fechar o dropdown antes da hora se necessário
    
    // O ideal seria um Dialog do Shadcn, mas confirm nativo é rápido e seguro
    const confirm = window.confirm(`Tem certeza que deseja excluir "${title}"?\nEssa ação é irreversível.`)
    
    if (!confirm) return

    setIsDeleting(true)
    const result = await deleteProperty(id)
    
    if (result?.error) {
      alert(result.error)
    } else {
      // Sucesso
    }
    setIsDeleting(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-red-50 hover:text-red-600 text-red-500 w-full"
    >
      {isDeleting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-2 h-3.5 w-3.5" />}
      Excluir Imóvel
    </button>
  )
}