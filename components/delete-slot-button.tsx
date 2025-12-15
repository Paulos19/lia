'use client'

import { deleteVisitSlot } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function DeleteSlotButton({ id }: { id: string }) {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={async () => await deleteVisitSlot(id)}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}