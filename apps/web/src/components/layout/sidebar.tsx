'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUiStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import {
  LayoutDashboard, TrendingUp, Package, BarChart2,
  Bell, Settings, ShoppingBag, LogOut, ChevronLeft, ChevronRight,
  Search, Zap, Map
} from 'lucide-react';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/opportunities', label: 'Opportunities', icon: TrendingUp },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/analysis', label: 'Analysis', icon: BarChart2 },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/geolocation', label: 'Nearby Deals', icon: Map },
  { href: '/scanner', label: 'Scanner', icon: Zap },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout();
    toast.success('Signed out successfully');
    router.push('/login');
  };

  return (
    <aside className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm z-40 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between min-h-[64px]">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">R</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">RAI Platform</span>
          </div>
        )}
        {!sidebarOpen && (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white text-sm font-bold">R</span>
          </div>
        )}
        <button onClick={toggleSidebar} className="text-gray-400 hover:text-gray-600 transition-colors ml-auto">
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span className="text-sm truncate">{label}</span>}
              {!sidebarOpen && (
                <span className="absolute left-full ml-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-gray-200">
        {sidebarOpen && user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{user.plan}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut size={18} className="shrink-0" />
          {sidebarOpen && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
