// app/(admin)/layout.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // Dupla checagem (além do middleware)
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Simples */}
      <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
        <h1 className="text-xl font-bold mb-8">Lia Dashboard</h1>
        <nav className="flex flex-col gap-2">
          <Link href="/admin/dashboard" className="p-2 hover:bg-slate-800 rounded">Visão Geral</Link>
          <Link href="/admin/properties" className="p-2 hover:bg-slate-800 rounded">Imóveis</Link>
          <Link href="/admin/leads" className="p-2 hover:bg-slate-800 rounded">Leads</Link>
          <Link href="/admin/brain" className="p-2 hover:bg-slate-800 rounded text-purple-300">Cérebro da IA</Link>
        </nav>
        <div className="mt-auto pt-10">
          <p className="text-xs text-slate-500">Logado como {session.user.name}</p>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 bg-slate-50 p-8">
        {children}
      </main>
    </div>
  )
}