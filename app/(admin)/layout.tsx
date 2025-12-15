import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { SidebarProvider } from '@/hooks/use-sidebar'
import { AdminShell } from '@/components/admin-shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50 relative">
        <Sidebar />
        
        <AdminShell>
          {children}
        </AdminShell>
      </div>
    </SidebarProvider>
  )
}