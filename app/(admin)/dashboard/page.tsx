// app/(admin)/dashboard/page.tsx
export default function Dashboard() {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <p className="text-muted-foreground mt-2">Bem-vinda de volta, Neusilene.</p>
      
      <div className="grid gap-4 md:grid-cols-3 mt-8">
        <div className="p-6 bg-white rounded-xl shadow-sm border">
          <h3 className="font-semibold text-sm text-slate-500">Total de Imóveis</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border">
          <h3 className="font-semibold text-sm text-slate-500">Leads Quentes</h3>
          <p className="text-2xl font-bold mt-2 text-orange-600">0</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border">
          <h3 className="font-semibold text-sm text-slate-500">Atendimentos Hoje</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
      </div>
    </div>
  )
}