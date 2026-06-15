'use client';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, opportunitiesApi } from '@/lib/api';
import { TrendingUp, Package, DollarSign, BarChart2, ArrowUpRight, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

function KpiCard({ title, value, subtitle, icon: Icon, color, trend }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <ArrowUpRight size={12} className="text-green-500" />
          <span className="text-xs text-green-600 font-medium">{trend}</span>
        </div>
      )}
    </div>
  );
}

function OpportunityRow({ opp }: { opp: any }) {
  const roiColor = opp.estimatedRoi >= 50 ? 'text-green-600 bg-green-50' : opp.estimatedRoi >= 30 ? 'text-blue-600 bg-blue-50' : 'text-yellow-600 bg-yellow-50';
  const riskColors: Record<string, string> = {
    VERY_LOW: 'bg-green-100 text-green-700',
    LOW: 'bg-green-50 text-green-600',
    MEDIUM: 'bg-yellow-50 text-yellow-700',
    HIGH: 'bg-red-50 text-red-600',
    VERY_HIGH: 'bg-red-100 text-red-700',
  };

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {opp.product?.imageUrl && (
            <img src={opp.product.imageUrl} alt={opp.product.title} className="w-10 h-10 object-contain rounded-lg bg-gray-100" onError={e => (e.currentTarget.style.display = 'none')} />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{opp.product?.title}</p>
            <p className="text-xs text-gray-500">{opp.product?.brand} · {opp.product?.category}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-gray-700">{opp.retailStoreName}</td>
      <td className="py-3 px-4 text-sm font-medium text-gray-900">${opp.buyPrice?.toFixed(2)}</td>
      <td className="py-3 px-4 text-sm font-medium text-gray-900">${opp.sellPrice?.toFixed(2)}</td>
      <td className="py-3 px-4">
        <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${roiColor}`}>
          +${opp.estimatedProfit?.toFixed(2)}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${roiColor}`}>
          {opp.estimatedRoi?.toFixed(1)}%
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${riskColors[opp.riskLevel] ?? 'bg-gray-100 text-gray-600'}`}>
          {opp.riskLevel?.replace('_', ' ')}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-16">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(opp.overallScore, 100)}%` }} />
          </div>
          <span className="text-xs text-gray-500">{opp.overallScore?.toFixed(0)}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <div>
          <p className="text-xs font-medium text-gray-800">{opp.aiRecommendation?.replace('_', ' ')}</p>
          {opp.aiSummary && <p className="text-xs text-gray-400 truncate max-w-[200px]">{opp.aiSummary?.substring(0, 80)}...</p>}
        </div>
      </td>
      <td className="py-3 px-4">
        <Link href={`/opportunities/${opp.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">View →</Link>
      </td>
    </tr>
  );
}

export default function DashboardPage() {
  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsApi.dashboard().then((r: any) => r.data),
    refetchInterval: 60000,
  });

  const { data: oppsData, isLoading: oppsLoading } = useQuery({
    queryKey: ['opportunities', 'list'],
    queryFn: () => opportunitiesApi.list({ limit: 20, sortBy: 'overallScore', sortOrder: 'desc' }).then((r: any) => r.data),
  });

  if (dashLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36 rounded-xl" />)}
        </div>
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  const kpis = dashData?.kpis;
  const trend = dashData?.opportunityTrend ?? [];
  const roiDist = dashData?.roiDistribution ?? [];
  const opportunities = oppsData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time arbitrage intelligence</p>
        </div>
        <Link href="/scanner" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Zap size={16} />
          Run Scan
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Opportunities"
          value={kpis?.activeOpportunities ?? 0}
          subtitle={`${kpis?.newThisMonth ?? 0} new this month`}
          icon={TrendingUp}
          color="bg-blue-600"
          trend="Live opportunities"
        />
        <KpiCard
          title="Average ROI"
          value={`${(kpis?.avgRoi ?? 0).toFixed(1)}%`}
          subtitle="Across all active deals"
          icon={BarChart2}
          color="bg-green-600"
          trend="Active deals avg"
        />
        <KpiCard
          title="Potential Profit"
          value={`$${((kpis?.totalPotentialProfit ?? 0) / 1000).toFixed(1)}k`}
          subtitle="Total if all purchased"
          icon={DollarSign}
          color="bg-purple-600"
        />
        <KpiCard
          title="Products Monitored"
          value={kpis?.productsMonitored ?? 0}
          subtitle="In product catalog"
          icon={Package}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Opportunity Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Opportunities (30 days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="colorOpp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val: any) => [val, 'Opportunities']} labelFormatter={l => `Date: ${l}`} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#colorOpp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ROI Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">ROI Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={roiDist} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={70} label={({ label }) => label}>
                {roiDist.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Top Opportunities</h2>
          <Link href="/opportunities" className="text-blue-600 hover:text-blue-800 text-sm font-medium">View all →</Link>
        </div>
        {oppsLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : opportunities.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No active opportunities</p>
            <p className="text-gray-400 text-sm mt-1">Run a scan to discover deals</p>
            <Link href="/scanner" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              Start Scanning
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Product', 'Store', 'Buy', 'Sell', 'Profit', 'ROI', 'Risk', 'Score', 'AI', ''].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp: any) => <OpportunityRow key={opp.id} opp={opp} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
