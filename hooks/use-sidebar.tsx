'use client'

import { createContext, useContext, useEffect, useState } from "react"

interface SidebarContextType {
  collapsed: boolean
  toggle: () => void
  setCollapsed: (value: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false) // Padrão inicial: Aberto (false) para evitar erro de hidratação
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Lógica segura para rodar apenas no navegador
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setCollapsedState(true)
      }
    }

    // Recupera preferência do usuário
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved) {
      setCollapsedState(JSON.parse(saved))
    }

    // Configuração inicial
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const setCollapsed = (value: boolean) => {
    setCollapsedState(value)
    localStorage.setItem("sidebar-collapsed", JSON.stringify(value))
  }

  const toggle = () => setCollapsed(!collapsed)

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar deve ser usado dentro de um SidebarProvider")
  }
  return context
}