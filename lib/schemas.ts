// lib/schemas.ts
import { z } from "zod"

export const propertyFormSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
  description: z.string().min(20, "A descrição pública precisa ser mais detalhada"),
  aiContext: z.string().optional(), // Contexto informal para a Lia
  location: z.string().min(3, "Informe o endereço ou bairro"),
  price: z.coerce.number().min(1, "O preço é obrigatório"), // coerce converte string do input para number
  images: z.array(z.string()).min(1, "Adicione pelo menos uma foto"),
  features: z.string().optional(), // Receberemos como string separada por vírgula e converteremos depois
})

export type PropertyFormValues = z.infer<typeof propertyFormSchema>