'use client'
import { useState } from 'react'
export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('')
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold mb-2">⚙️ Configurações</h1><p className="text-slate-400">Configure as integrações e preferências do sistema</p></div>
      <div className="max-w-2xl space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">APIs e Integrações</h2>
          <div className="space-y-4">
            {['Amazon SP-API', 'Walmart Marketplace', 'eBay Browse API', 'OpenAI GPT-4'].map(api => (
              <div key={api} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <span className="text-sm">{api}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-900/50 text-green-400">Configurado</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Alertas</h2>
          <div className="space-y-3">
            {['Email', 'Telegram', 'WhatsApp', 'Push Notification'].map(ch => (
              <div key={ch} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{ch}</span>
                <div className="w-10 h-6 bg-blue-600 rounded-full cursor-pointer"/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}