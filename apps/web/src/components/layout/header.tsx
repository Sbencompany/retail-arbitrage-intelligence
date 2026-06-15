'use client'
export function Header() {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-white">Retail Arbitrage Intelligence</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-400">Sbencompany</span>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">S</div>
      </div>
    </header>
  )
}