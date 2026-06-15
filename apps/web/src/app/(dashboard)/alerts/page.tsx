'use client'
const alerts = [
  { id: 1, type: 'success', title: 'Nova oportunidade detectada', message: 'Ninja Foodi Air Fryer - ROI 53.1%', time: '2 min atrás', read: false },
  { id: 2, type: 'info', title: 'Preço atualizado', message: 'Sony WH-1000XM5 caiu para $199.99 na Best Buy', time: '15 min atrás', read: false },
  { id: 3, type: 'warning', title: 'Concorrência aumentou', message: 'Apple AirPods Pro - 3 novos vendedores', time: '1h atrás', read: true },
  { id: 4, type: 'success', title: 'Venda confirmada', message: 'KitchenAid Stand Mixer vendido por $379.00', time: '2h atrás', read: true },
]
export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold mb-2">🔔 Alertas</h1><p className="text-slate-400">Notificações em tempo real do sistema</p></div>
      <div className="space-y-3 max-w-2xl">
        {alerts.map(a => (
          <div key={a.id} className={`p-4 rounded-xl border ${a.read ? 'bg-slate-900 border-slate-800' : 'bg-slate-800 border-blue-700/50'}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className={`font-medium ${a.read ? 'text-slate-400' : 'text-white'}`}>{a.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{a.message}</p>
              </div>
              <span className="text-xs text-slate-500">{a.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}