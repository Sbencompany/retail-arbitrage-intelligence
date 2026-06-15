'use client'
import { useState } from 'react'
export default function ScannerPage() {
  const [upc, setUpc] = useState('')
  const [result, setResult] = useState(null as any)
  const scan = () => {
    setResult({ product: 'Ninja Foodi Air Fryer 8qt XL', amazon: '$159.99', walmart: '$89.99', roi: '53.1%', score: 97 })
  }
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold mb-2">Scanner</h1><p className="text-slate-400">Escaneie codigo de barras ou insira UPC/ASIN</p></div>
      <div className="max-w-lg">
        <div className="flex gap-3 mb-6">
          <input value={upc} onChange={e=>setUpc(e.target.value)} placeholder="UPC, EAN, ASIN ou nome..." className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          <button onClick={scan} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">Buscar</button>
        </div>
        {result && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4">{result.product}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-lg p-3"><div className="text-xs text-slate-400 mb-1">Amazon</div><div className="text-lg font-bold text-white">{result.amazon}</div></div>
              <div className="bg-slate-800 rounded-lg p-3"><div className="text-xs text-slate-400 mb-1">Walmart</div><div className="text-lg font-bold text-green-400">{result.walmart}</div></div>
              <div className="bg-blue-900/30 rounded-lg p-3"><div className="text-xs text-slate-400 mb-1">ROI</div><div className="text-lg font-bold text-blue-400">{result.roi}</div></div>
              <div className="bg-green-900/30 rounded-lg p-3"><div className="text-xs text-slate-400 mb-1">Score</div><div className="text-lg font-bold text-green-400">{result.score}/100</div></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}