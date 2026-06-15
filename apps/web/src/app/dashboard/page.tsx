'use client'

import { useState } from 'react'

const kpis = [
  { label: 'Oportunidades Ativas', value: '247', change: '+12%', icon: '🎯', color: 'blue' },
  { label: 'ROI Médio', value: '38.4%', change: '+5.2%', icon: '📈', color: 'green' },
  { label: 'Lucro Potencial', value: '$12,847', change: '+$2,100', icon: '💰', color: 'yellow' },
  { label: 'Produtos Monitorados', value: '1,892', change: '+143', icon: '📦', color: 'purple' },
]

const opportunities = [
  { product: 'Sony WH-1000XM5 Headphones', store: 'Best Buy', buy: '$199.99', sell: '$289.00', profit: '$52.20', roi: '26.1%', demand: 'Alta', competition: 'Baixa', score: 94, ai: 'Comprar 15 unidades' },
  { product: 'Apple AirPods Pro (2nd Gen)', store: 'Walmart', buy: '$179.99', sell: '$249.00', profit: '$41.50', roi: '23.1%', demand: 'Muito Alta', competition: 'Média', score: 89, ai: 'Comprar 10 unidades' },
  { product: 'Ninja Foodi Air Fryer 8qt', store: 'Target', buy: '$89.99', sell: '$159.99', profit: '$47.80', roi: '53.1%', demand: 'Alta', competition: 'Baixa', score: 97, ai: 'Comprar 25 unidades' },
  { product: 'Instant Pot Duo 7-in-1', store: 'Costco', buy: '$59.99', sell: '$99.95', profit: '$24.20', roi: '40.3%', demand: 'Média', competition: 'Alta', score: 72, ai: 'Aguardar' },
  { product: 'Dyson V11 Vacuum', store: 'Home Depot', buy: '$399.99', sell: '$599.00', profit: '$128.50', roi: '32.1%', demand: 'Alta', competition: 'Baixa', score: 91, ai: 'Comprar 5 unidades' },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏪</span>
            <div>
              <h1 className="text-lg font-bold text-white">Retail Arbitrage Intelligence</h1>
              <p className="text-xs text-slate-400">Dashboard Principal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Última atualização: agora</span>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">S</div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6">
        <div className="flex gap-1">
          {['Dashboard', 'Oportunidades', 'Produtos', 'Análise', 'Alertas', 'Scanner', 'Configurações'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.toLowerCase() ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <main className="p-6 space-y-6">
        {/* AI Summary */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <h3 className="font-semibold text-blue-300 mb-1">Resumo IA — Hoje</h3>
              <p className="text-slate-300 text-sm">
                Detectei <strong className="text-white">247 oportunidades</strong> hoje com ROI médio de 38.4%. 
                Destaque: <strong className="text-white">Ninja Foodi Air Fryer</strong> com ROI de 53.1%, lucro líquido de $47.80 por unidade, 
                baixa concorrência e demanda alta. <strong className="text-green-400">Recomendação: comprar até 25 unidades.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{kpi.icon}</span>
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">{kpi.change}</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
              <div className="text-sm text-slate-400">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Opportunities Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">🎯 Melhores Oportunidades</h2>
            <button className="text-sm text-blue-400 hover:text-blue-300">Ver todas →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Produto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Loja</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Compra</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Venda</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Lucro</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">ROI</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Demanda</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Rec. IA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {opportunities.map((opp, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-white max-w-[200px] truncate">{opp.product}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-400">{opp.store}</td>
                    <td className="px-4 py-4 text-sm text-right text-white">{opp.buy}</td>
                    <td className="px-4 py-4 text-sm text-right text-white">{opp.sell}</td>
                    <td className="px-4 py-4 text-sm text-right text-green-400 font-medium">{opp.profit}</td>
                    <td className="px-4 py-4 text-sm text-right">
                      <span className="text-blue-400 font-bold">{opp.roi}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${opp.demand === 'Alta' || opp.demand === 'Muito Alta' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                        {opp.demand}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold" style={{background: opp.score >= 90 ? '#166534' : opp.score >= 80 ? '#1e40af' : '#78350f', color: 'white'}}>
                        {opp.score}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-300 max-w-[150px]">{opp.ai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
