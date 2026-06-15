'use client'
import { useState } from 'react'
export default function AnalysisPage() {
  const [buyPrice, setBuyPrice] = useState('89.99')
  const [sellPrice, setSellPrice] = useState('159.99')
  const profit = (parseFloat(sellPrice) - parseFloat(buyPrice) - 15.20).toFixed(2)
  const roi = ((parseFloat(profit) / parseFloat(buyPrice)) * 100).toFixed(1)
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold mb-2">Analise de Rentabilidade</h1><p className="text-slate-400">Calcule ROI e lucro estimado de qualquer produto</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Calculadora</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Preco de Compra ($)</label>
              <input value={buyPrice} onChange={e=>setBuyPrice(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Preco de Venda ($)</label>
              <input value={sellPrice} onChange={e=>setSellPrice(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Resultado</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-slate-800"><span className="text-slate-400">Preco de Compra</span><span>${buyPrice}</span></div>
            <div className="flex justify-between py-2 border-b border-slate-800"><span className="text-slate-400">Taxas Amazon FBA</span><span className="text-red-400">-$15.20</span></div>
            <div className="flex justify-between py-2 border-b border-slate-800"><span className="text-slate-400">Lucro Liquido</span><span className="text-green-400 font-bold">${profit}</span></div>
            <div className="flex justify-between py-3 bg-blue-900/30 rounded-lg px-3"><span className="font-semibold">ROI</span><span className="text-blue-400 font-bold text-xl">{roi}%</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}