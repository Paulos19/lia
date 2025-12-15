import { getLiaConfig } from "@/lib/actions"
import { BrainConfig } from "@/components/brain/brain-config"

export default async function BrainPage() {
  const config = await getLiaConfig()

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Cérebro da Lia 🧠</h2>
        <p className="text-slate-500">
          Configure a personalidade, tom de voz e regras de atendimento da sua Inteligência Artificial.
        </p>
      </div>

      <BrainConfig initialConfig={config} />
    </div>
  )
}