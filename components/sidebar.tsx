'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  LayoutDashboard, Building2, CalendarDays, Users, BrainCircuit, 
  ChevronLeft, LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/hooks/use-sidebar"

const MENU_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Imóveis", icon: Building2, href: "/admin/properties" },
  { label: "Agenda", icon: CalendarDays, href: "/admin/schedule" },
  { label: "Leads", icon: Users, href: "/admin/leads" },
  { label: "Cérebro IA", icon: BrainCircuit, href: "/admin/brain", variant: "special" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebar()

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed left-0 top-0 h-screen z-40 flex flex-col",
          "bg-slate-950 border-r border-slate-800 shadow-2xl overflow-hidden"
        )}
      >
        <div className="flex items-center h-20 px-5">
          <Logo collapsed={collapsed} />
        </div>

        <button
          onClick={toggle}
          className={cn(
            "absolute -right-3 top-24 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 transition-colors hover:text-white hover:bg-slate-800",
            collapsed && "rotate-180"
          )}
        >
          <ChevronLeft size={14} />
        </button>

        <div className="flex-1 px-3 py-6 space-y-2 overflow-y-auto scrollbar-none">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const isSpecial = item.variant === "special"

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link href={item.href} className="block">
                    <div className={cn(
                      "relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group overflow-hidden",
                      isActive ? "bg-indigo-600/10 text-indigo-400" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200",
                      isSpecial && !isActive && "text-purple-400 hover:bg-purple-400/10 hover:text-purple-300"
                    )}>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 rounded-xl bg-indigo-600/10 border border-indigo-600/20"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      
                      <div className="min-w-[24px] flex justify-center">
                        <item.icon size={22} className={cn("relative z-10 transition-colors", isActive ? "text-indigo-400" : "group-hover:text-slate-200", isSpecial && "text-purple-400")} />
                      </div>

                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="relative z-10 font-medium whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </div>
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-slate-900 text-white border-slate-700 ml-4 font-medium">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className={cn("flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-slate-900 cursor-pointer overflow-hidden", collapsed && "justify-center")}>
            <Avatar className="h-9 w-9 border border-slate-700 shrink-0">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>NA</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex-1 overflow-hidden"
              >
                <p className="text-sm font-medium text-white truncate">Neusilene A.</p>
                <p className="text-xs text-slate-500 truncate">Admin</p>
              </motion.div>
            )}
            {!collapsed && (
              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 h-8 w-8 shrink-0">
                <LogOut size={16} />
              </Button>
            )}
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}