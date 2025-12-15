'use client'

import { motion } from "framer-motion"
import { useSidebar } from "@/hooks/use-sidebar"

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <motion.main 
      initial={false}
      animate={{ 
        marginLeft: collapsed ? 80 : 280, 
        width: collapsed ? "calc(100% - 80px)" : "calc(100% - 280px)"
      }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 min-h-screen transition-all"
    >
      <div className="h-full p-8 max-w-[1600px] mx-auto">
        {children}
      </div>
    </motion.main>
  )
}