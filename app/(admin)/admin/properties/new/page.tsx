'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { propertyFormSchema, PropertyFormValues } from "@/lib/schemas"
import { createProperty } from "@/lib/actions"
import { upload } from "@vercel/blob/client" // Função mágica de upload
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, X, UploadCloud } from "lucide-react"
import Image from "next/image"

export default function NewPropertyPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      aiContext: "",
      location: "",
      price: 0,
      images: [], // Começa vazio
      features: "",
    },
  })

  // Função para lidar com o input de arquivo
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setIsUploading(true)
    const file = e.target.files[0]

    try {
      // Faz o upload direto pro Vercel Blob usando nossa API de autenticação
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      })

      // Adiciona a URL retornada ao array de imagens do formulário
      const currentImages = form.getValues("images")
      form.setValue("images", [...currentImages, newBlob.url])
      
    } catch (error) {
      console.error(error)
      alert("Erro ao fazer upload da imagem")
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: PropertyFormValues) => {
    setIsSaving(true)
    const result = await createProperty(data)
    if (result?.error) {
      alert(result.error)
      setIsSaving(false)
    }
    // Se der certo, o server action faz o redirect
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Novo Imóvel</h1>
        <p className="text-slate-500">Adicione um imóvel ao catálogo da Lia.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna da Esquerda: Dados Básicos */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes Principais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Anúncio</FormLabel>
                        <FormControl><Input placeholder="Ex: Apartamento Vista Mar" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                        <FormControl><Input placeholder="Bairro ou Endereço" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="features"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Características (separar por vírgula)</FormLabel>
                        <FormControl><Input placeholder="Piscina, Suite, Garagem..." {...field} /></FormControl>
                        <FormDescription>Isso ajuda a Lia a filtrar.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Multimídia</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Visualização das Imagens */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {form.watch("images").map((url, index) => (
                      <div key={index} className="relative aspect-square bg-slate-100 rounded-md overflow-hidden border">
                         <Image src={url} alt="Preview" fill className="object-cover" />
                         <button 
                           type="button"
                           onClick={() => {
                             const newImages = form.getValues("images").filter((_, i) => i !== index)
                             form.setValue("images", newImages)
                           }}
                           className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                         >
                           <X size={12} />
                         </button>
                      </div>
                    ))}
                  </div>

                  {/* Botão de Upload */}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 border-slate-300">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploading ? (
                          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        ) : (
                          <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                        )}
                        <p className="text-sm text-slate-500">
                          {isUploading ? "Enviando..." : "Clique para enviar foto"}
                        </p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                    </label>
                  </div>
                  <FormMessage>{form.formState.errors.images?.message}</FormMessage>
                </CardContent>
              </Card>
            </div>

            {/* Coluna da Direita: Cérebro da IA */}
            <div className="space-y-6">
              <Card className="border-purple-200 bg-purple-50/30">
                <CardHeader>
                  <CardTitle className="text-purple-900">Cérebro da Lia 🧠</CardTitle>
                  <CardDescription>Informações que só a IA vê para convencer o cliente.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição Pública (Site)</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-[100px] bg-white" placeholder="Descrição formal do imóvel..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aiContext"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-purple-800">Contexto Oculto (O Segredo)</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="min-h-[150px] bg-white border-purple-200 focus-visible:ring-purple-500" 
                            placeholder="Ex: O vizinho de cima é o síndico (muito chato), mas a vista do pôr do sol compensa. A padaria da esquina tem o melhor pão de queijo. Aceita permuta em carro." 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-purple-600/80">
                          Use linguagem natural. Conte tudo o que ajudaria a vender mas você não colocaria no anúncio oficial.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4">
             <Button type="button" variant="outline" onClick={() => useRouter.back()}>Cancelar</Button>
             <Button type="submit" disabled={isSaving || isUploading}>
               {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               Salvar Imóvel
             </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}