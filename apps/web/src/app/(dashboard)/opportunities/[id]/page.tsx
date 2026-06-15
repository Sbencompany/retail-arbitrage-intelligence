export default function OpportunityPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Oportunidade #{params.id}</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p className="text-slate-400">Detalhes da oportunidade carregando...</p>
      </div>
    </div>
  )
}