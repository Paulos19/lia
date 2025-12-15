'use client'

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

interface LogoProps {
  collapsed?: boolean
}

export function Logo({ collapsed = false }: LogoProps) {
  return (
    <div className="flex items-center gap-3 overflow-hidden">
      {/* Ícone da Marca */}
      <div className="relative flex items-center justify-center w-10 h-10 min-w-[40px] rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-lg shadow-indigo-500/20">
        <Sparkles className="text-white w-5 h-5" />
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
      </div>

      {/* Texto da Marca (Desaparece suavemente) */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="flex flex-col"
        >
          <span className="font-bold text-lg tracking-tight text-white leading-tight">
            Lia <span className="text-indigo-400">AI</span>
          </span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
            Imóveis
          </span>
        </motion.div>
      )}
    </div>
  )
}