'use client'

import { deleteProperty } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { useState } from "react"

export function DeletePropertyButton({ id, title }: { id: string, title: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    const confirm = window.confirm(`Tem certeza que deseja excluir o imóvel "${title}"?\nA Lia não poderá mais oferecê-lo.`)
    
    if (!confirm) return

    setIsDeleting(true)
    const result = await deleteProperty(id)
    
    if (result?.error) {
      alert(result.error)
    } 
    // O revalidatePath no servidor fará a mágica de atualizar a tela
    setIsDeleting(false)
  }

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleDelete} 
      disabled={isDeleting}
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  )
}