'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { propertyFormSchema, PropertyFormValues } from "@/lib/schemas"
import { createProperty, updateProperty } from "@/lib/actions"
import { upload } from "@vercel/blob/client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Property } from "@prisma/client" // Tipagem original

// ... imports UI (Button, Input, etc) ...
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, X, UploadCloud, Save } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

// --- CORREÇÃO DE TIPAGEM ---
// Definimos que o componente aceita um imóvel onde 'price' já foi convertido para number
type SerializedProperty = Omit<Property, 'price'> & { price: number }

interface PropertyFormProps {
  initialData?: SerializedProperty | null
}

export function PropertyForm({ initialData }: PropertyFormProps) {
  // ... resto do código (hooks, states) permanece IGUAL ...
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const defaultValues: Partial<PropertyFormValues> = initialData ? {
    title: initialData.title,
    description: initialData.description,
    aiContext: initialData.aiContext || "",
    location: initialData.location,
    // Aqui não precisa mais de Number(), pois já vem convertido, mas mal não faz
    price: Number(initialData.price),
    images: initialData.images,
    features: initialData.features.join(", "),
  } : {
    title: "",
    description: "",
    aiContext: "",
    location: "",
    price: 0,
    images: [],
    features: "",
  }

  // ... (todo o resto do componente continua idêntico) ...
  
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues,
  })

  // ... (handleFileChange, onSubmit, return JSX) ...
  // Copie o restante do código que você já tem, apenas garantindo que
  // a interface PropertyFormProps e o uso do initialData estejam como acima.
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setIsUploading(true)
    const file = e.target.files[0]
    try {
      const newBlob = await upload(file.name, file, { access: 'public', handleUploadUrl: '/api/upload' })
      const currentImages = form.getValues("images")
      form.setValue("images", [...currentImages, newBlob.url])
      toast.success("Imagem enviada!")
    } catch (error) {
      console.error(error)
      toast.error("Erro no upload da imagem")
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: PropertyFormValues) => {
    setIsSaving(true)
    let result

    if (initialData) {
      result = await updateProperty(initialData.id, data)
    } else {
      result = await createProperty(data)
    }

    if (result?.error) {
      toast.error(result.error)
      setIsSaving(false)
    } else {
      toast.success(initialData ? "Imóvel atualizado!" : "Imóvel criado!")
    }
  }

  const title = initialData ? "Editar Imóvel" : "Novo Imóvel"
  const subtitle = initialData ? "Atualize as informações do catálogo." : "Adicione um imóvel ao catálogo da Lia."
  const actionLabel = initialData ? "Salvar Alterações" : "Criar Imóvel"

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            <p className="text-slate-500">{subtitle}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Imóvel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl><Input placeholder="Ex: Cobertura Duplex..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Preço (R$)</FormLabel>
                            <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Localização</FormLabel>
                            <FormControl><Input placeholder="Bairro, Cidade" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="features"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Características</FormLabel>
                        <FormControl><Input placeholder="Piscina, Churrasqueira, 2 Vagas..." {...field} /></FormControl>
                        <FormDescription>Separe os itens por vírgula.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição Pública</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-[120px]" placeholder="Descrição completa para o site..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="border-indigo-100 bg-indigo-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-700">
                     ✨ Cérebro da Lia
                  </CardTitle>
                  <CardDescription className="text-indigo-600/80">
                    Segredos e detalhes que ajudam a IA a vender, mas não aparecem publicamente.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="aiContext"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            className="min-h-[100px] bg-white border-indigo-200 focus-visible:ring-indigo-500" 
                            placeholder="Ex: Aceita permuta por carro. O proprietário tem pressa. Sol da manhã na varanda..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Galeria de Fotos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {form.watch("images").map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-slate-200 group">
                         <Image src={url} alt="Preview" fill className="object-cover" />
                         <button 
                           type="button"
                           onClick={() => {
                             const newImages = form.getValues("images").filter((_, i) => i !== index)
                             form.setValue("images", newImages)
                           }}
                           className="absolute top-1 right-1 bg-red-500/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           <X size={12} />
                         </button>
                      </div>
                    ))}
                    
                     <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-200 rounded-md cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-colors">
                        {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : <UploadCloud className="h-6 w-6 text-slate-400" />}
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                     </label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                 <Button type="submit" size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isSaving || isUploading}>
                   {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   {isSaving ? "Salvando..." : <><Save className="mr-2 h-4 w-4" /> {actionLabel}</>}
                 </Button>
                 <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
                   Cancelar
                 </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}