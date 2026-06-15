'use client'
import { useState } from 'react'

const data = [
  { id: 1, product: 'Sony WH-1000XM5', store: 'Best Buy', buy: '$199.99', sell: '$289.00', profit: '$52.20', roi: '26.1%', score: 94 },
  { id: 2, product: 'Apple AirPods Pro', store: 'Walmart', buy: '$179.99', sell: '$249.00', profit: '$41.50', roi: '23.1%', score: 89 },
  { id: 3, product: 'Ninja Foodi Air Fryer', store: 'Target', buy: '$89.99', sell: '$159.99', profit: '$47.80', roi: '53.1%', score: 97 },
  { id: 4, product: 'Instant Pot Duo 7-in-1', store: 'Costco', buy: '$59.99', sell: '$99.95', profit: '$24.20', roi: '40.3%', score: 72 },
  { id: 5, product: 'Dyson V11 Vacuum', store: 'Home Depot', buy: '$399.99', sell: '$599.00', profit: '$128.50', roi: '32.1%', score: 91 },
  { id: 6, product: 'KitchenAid Stand Mixer', store: 'Target', buy: '$249.99', sell: '$379.00', profit: '$83.20', roi: '33.3%', score: 86 },
]

export default function OpportunitiesPage() {
  const [search, setSearch] = useState('')
  const filtered = data.filter(d => d.product.toLowerCase().includes(search.toLowerCase()))
  
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">🎯 Oportunidades</h1>
        <p className="text-slate-400">Produtos com alto potencial de lucro detectados automaticamente</p>
      </div>
      <div className="mb-4">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar produto..." className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"/>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-slate-800">
            <th className="px-4 py-3 text-left text-xs text-slate-400 uppercase">Produto</th>
            <th className="px-4 py-3 text-left text-xs text-slate-400 uppercase">Loja</th>
            <th className="px-4 py-3 text-right text-xs text-slate-400 uppercase">Compra</th>
            <th className="px-4 py-3 text-right text-xs text-slate-400 uppercase">Venda</th>
            <th className="px-4 py-3 text-right text-xs text-slate-400 uppercase">Lucro</th>
            <th className="px-4 py-3 text-right text-xs text-slate-400 uppercase">ROI</th>
            <th className="px-4 py-3 text-center text-xs text-slate-400 uppercase">Score</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.map(d => (
              <tr key={d.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-4 text-sm font-medium">{d.product}</td>
                <td className="px-4 py-4 text-sm text-slate-400">{d.store}</td>
                <td className="px-4 py-4 text-sm text-right">{d.buy}</td>
                <td className="px-4 py-4 text-sm text-right">{d.sell}</td>
                <td className="px-4 py-4 text-sm text-right text-green-400 font-medium">{d.profit}</td>
                <td className="px-4 py-4 text-sm text-right text-blue-400 font-bold">{d.roi}</td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold bg-green-900/50 text-green-400">{d.score}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}