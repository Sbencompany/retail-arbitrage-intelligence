'use client'

import { useState } from 'react'

const kpis = [
  { label: 'Oportunidades Ativas', value: '247', change: '+12%', icon: 'Target' },
  { label: 'ROI Medio', value: '38.4%', change: '+5.2%', icon: 'TrendingUp' },
  { label: 'Lucro Potencial', value: '$12,847', change: '+$2,100', icon: 'DollarSign' },
  { label: 'Produtos Monitorados', value: '1,892', change: '+143', icon: 'Package' },
]

const opportunities = [
  { product: 'Sony WH-1000XM5 Headphones', store: 'Best Buy', buy: '$199.99', sell: '$289.00', profit: '$52.20', roi: '26.1%', demand: 'Alta', score: 94, ai: 'Comprar 15 unidades' },
  { product: 'Apple AirPods Pro (2nd Gen)', store: 'Walmart', buy: '$179.99', sell: '$249.00', profit: '$41.50', roi: '23.1%', demand: 'Muito Alta', score: 89, ai: 'Comprar 10 unidades' },
  { product: 'Ninja Foodi Air Fryer 8qt', store: 'Target', buy: '$89.99', sell: '$159.99', profit: '$47.80', roi: '53.1%', demand: 'Alta', score: 97, ai: 'Comprar 25 unidades' },
  { product: 'Instant Pot Duo 7-in-1', store: 'Costco', buy: '$59.99', sell: '$99.95', profit: '$24.20', roi: '40.3%', demand: 'Media', score: 72, ai: 'Aguardar' },
  { product: 'Dyson V11 Vacuum', store: 'Home Depot', buy: '$399.99', sell: '$599.00', profit: '$128.50', roi: '32.1%', demand: 'Alta', score: 91, ai: 'Comprar 5 unidades' },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">&#x1F3EA;</span>
            <div>
              <h1 className="text-lg font-bold text-white">Retail Arbitrage Intelligence</h1>
              <p className="text-xs text-slate-400">Dashboard Principal</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">S</div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">&#x1F916;</span>
            <div>
              <h3 className="font-semibold text-blue-300 mb-1">Resumo IA</h3>
              <p className="text-slate-300 text-sm">Detectei <strong>247 oportunidades</strong> hoje com ROI medio de 38.4%. Destaque: <strong>Ninja Foodi Air Fryer</strong> com ROI 53.1%. <strong className="text-green-400">Recomendacao: comprar ate 25 unidades.</strong></p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
              <div className="text-sm text-slate-400">{kpi.label}</div>
              <div className="text-xs text-green-400 mt-1">{kpi.change}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">Melhores Oportunidades</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-slate-800/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Produto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Loja</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Compra</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Venda</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Lucro</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">ROI</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Rec. IA</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-800">
                {opportunities.map((opp, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="px-4 py-4"><div className="text-sm font-medium text-white max-w-[180px] truncate">{opp.product}</div></td>
                    <td className="px-4 py-4 text-sm text-slate-400">{opp.store}</td>
                    <td className="px-4 py-4 text-sm text-right">{opp.buy}</td>
                    <td className="px-4 py-4 text-sm text-right">{opp.sell}</td>
                    <td className="px-4 py-4 text-sm text-right text-green-400 font-medium">{opp.profit}</td>
                    <td className="px-4 py-4 text-sm text-right text-blue-400 font-bold">{opp.roi}</td>
                    <td className="px-4 py-4 text-center"><span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold bg-green-900 text-green-300">{opp.score}</span></td>
                    <td className="px-4 py-4 text-xs text-slate-300">{opp.ai}</td>
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