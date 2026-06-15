'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/opportunities', label: 'Oportunidades', icon: '🎯' },
  { href: '/scanner', label: 'Scanner', icon: '📱' },
  { href: '/analysis', label: 'Analise', icon: '📈' },
  { href: '/alerts', label: 'Alertas', icon: '🔔' },
  { href: '/settings', label: 'Configuracoes', icon: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 min-h-screen p-4">
      <div className="flex items-center gap-3 px-2 py-4 mb-6">
        <span className="text-2xl">&#x1F3EA;</span>
        <span className="font-bold text-white text-sm">RAI Platform</span>
      </div>
      <nav className="space-y-1">
        {navItems.map(item => (
          <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === item.href ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}