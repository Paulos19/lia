'use client'

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode // MUDANÇA: Aceita o elemento JSX, não a função
  index: number
  trend?: "up" | "down" | "neutral"
}

export function MetricCard({ title, value, description, icon, index, trend }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300 border-slate-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            {title}
          </CardTitle>
          <div className={cn(
            "p-2 rounded-lg",
            trend === "up" ? "bg-green-100 text-green-600" : 
            trend === "down" ? "bg-red-100 text-red-600" : 
            "bg-slate-100 text-slate-600"
          )}>
            {/* MUDANÇA: Renderiza o node diretamente */}
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <p className="text-xs text-slate-500 mt-1">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}