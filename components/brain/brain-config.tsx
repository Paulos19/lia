'use client'

import { useState } from "react"
import { LiaConfig } from "@prisma/client"
import { updateLiaConfig } from "@/lib/actions"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { 
  BrainCircuit, 
  Save, 
  Power, 
  Sparkles, 
  AlertTriangle,
  RotateCcw,
  Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Um prompt padrão robusto caso ela queira resetar
const DEFAULT_PROMPT = `Você é LIA, a consultora imobiliária exclusiva da Neusilene (CRECI 77668).
Sua missão: Atender leads, qualificar o interesse e agendar visitas.

Personalidade:
- Profissional mas calorosa. Use emojis com moderação (máx 1 por msg).
- Objetiva. Não escreva "bíblias". Respostas curtas engajam mais.
- Persuasiva. Use os "Detalhes Internos" dos imóveis para gerar desejo.

Regras de Ouro:
1. Se o cliente perguntar preço, fale o preço E convide para visitar.
2. Nunca invente dados. Se não souber, diga que vai consultar a Neusilene.
3. Tente sempre mover a conversa para o agendamento de visita.`

interface BrainConfigProps {
  initialConfig?: LiaConfig | null
}

export function BrainConfig({ initialConfig }: BrainConfigProps) {
  const [isActive, setIsActive] = useState(initialConfig?.isActive ?? true)
  const [prompt, setPrompt] = useState(initialConfig?.systemPrompt || DEFAULT_PROMPT)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    const result = await updateLiaConfig({ 
        systemPrompt: prompt, 
        isActive 
    })
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Cérebro da Lia atualizado!")
    }
    setIsSaving(false)
  }

  function handleReset() {
    if(confirm("Isso vai substituir seu prompt atual pelo padrão. Continuar?")) {
        setPrompt(DEFAULT_PROMPT)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Coluna Esquerda: Status e Controles Rápidos */}
      <div className="space-y-6">
        <Card className={`border-2 transition-colors ${isActive ? 'border-green-100 bg-green-50/30' : 'border-slate-100 bg-slate-50'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Power className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-slate-400'}`} />
              Status do Sistema
            </CardTitle>
            <CardDescription>
              Define se a Lia responde automaticamente no WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                    {isActive ? "Sistema Ativo" : "Em Manutenção"}
                </Label>
                <p className="text-xs text-slate-500">
                    {isActive ? "A IA está respondendo leads." : "A IA está muda. Você assume."}
                </p>
              </div>
              <Switch 
                checked={isActive}
                onCheckedChange={setIsActive}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Dicas de Engenharia de Prompt</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-3">
            <p>
              <strong>1. Seja Específico:</strong> Não diga "seja legal". Diga "seja calorosa, use pronomes pessoais e evite gírias".
            </p>
            <p>
              <strong>2. Defina Limites:</strong> Diga explicitamente o que ela <em>NÃO</em> pode fazer (ex: "Não negocie valores abaixo de X").
            </p>
            <p>
              <strong>3. Venda o Sonho:</strong> Instrua a IA a usar os dados do campo "Contexto IA" dos imóveis.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Coluna Direita: Editor de Prompt */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col border-indigo-100 shadow-sm">
          <CardHeader className="bg-indigo-50/50 border-b border-indigo-50">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 text-indigo-900">
                        <BrainCircuit className="h-5 w-5 text-indigo-600" />
                        Personalidade & Regras
                    </CardTitle>
                    <CardDescription>
                        Este texto define como a Lia pensa e age. Edite com cuidado.
                    </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset} className="text-slate-400 hover:text-indigo-600">
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restaurar Padrão
                </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 relative">
             <Textarea 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               className="min-h-[500px] w-full resize-none border-0 focus-visible:ring-0 p-6 font-mono text-sm leading-relaxed text-slate-700 bg-transparent"
               placeholder="Escreva aqui as instruções da IA..."
             />
             {/* Overlay de carregamento opcional */}
             {isSaving && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-[1px]">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
             )}
          </CardContent>
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
             <Alert className="bg-amber-50 text-amber-900 border-amber-200 py-2 hidden sm:flex">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-xs font-bold mb-0 ml-2">Atenção:</AlertTitle>
                <AlertDescription className="text-xs ml-1 mt-0">
                    Mudanças aqui afetam o comportamento da IA imediatamente.
                </AlertDescription>
             </Alert>
             <div className="flex-1 sm:hidden"></div>
             
             <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]">
                {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                    </>
                ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                    </>
                )}
             </Button>
          </div>
        </Card>
      </div>

    </div>
  )
}