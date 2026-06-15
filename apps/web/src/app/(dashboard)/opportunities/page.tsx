'use client';
import { useQuery } from '@tanstack/react-query';
import { opportunitiesApi } from '@/lib/api';
import { useState } from 'react';
import { TrendingUp, Filter, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const riskColors: Record<string, string> = {
  VERY_LOW: 'bg-green-100 text-green-700', LOW: 'bg-green-50 text-green-600',
  MEDIUM: 'bg-yellow-50 text-yellow-700', HIGH: 'bg-red-50 text-red-600',
  VERY_HIGH: 'bg-red-100 text-red-700',
};
const recColors: Record<string, string> = {
  STRONG_BUY: 'bg-green-100 text-green-800', BUY: 'bg-blue-100 text-blue-800',
  HOLD: 'bg-yellow-100 text-yellow-800', AVOID: 'bg-red-100 text-red-800',
  NEUTRAL: 'bg-gray-100 text-gray-800',
};

export default function OpportunitiesPage() {
  const [filters, setFilters] = useState({ status: 'ACTIVE', minRoi: '', marketplace: '', page: 1, limit: 20 });

  const { data, isLoading } = useQuery({
    queryKey: ['opportunities', filters],
    queryFn: () => opportunitiesApi.list({ ...filters, minRoi: filters.minRoi || undefined }).then((r: any) => r.data),
  });

  const opportunities = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
          <p className="text-gray-500 text-sm">{meta?.total ?? 0} total opportunities</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option value="ACTIVE">Active</option>
            <option value="PURCHASED">Purchased</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
          <select value={filters.marketplace} onChange={e => setFilters(f => ({ ...f, marketplace: e.target.value, page: 1 }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option value="">All Marketplaces</option>
            <option value="AMAZON">Amazon</option>
            <option value="WALMART">Walmart</option>
            <option value="EBAY">eBay</option>
          </select>
          <input type="number" placeholder="Min ROI %" value={filters.minRoi}
            onChange={e => setFilters(f => ({ ...f, minRoi: e.target.value, page: 1 }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-32" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading opportunities...</div>
        ) : opportunities.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No opportunities found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Product', 'Store', 'Buy', 'Sell', 'Profit', 'ROI', 'Score', 'Risk', 'Recommendation', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {opportunities.map((opp: any) => (
                  <tr key={opp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        {opp.product?.imageUrl && <img src={opp.product.imageUrl} className="w-8 h-8 object-contain rounded bg-gray-100" onError={e => (e.currentTarget.style.display = 'none')} />}
                        <p className="text-sm font-medium text-gray-900 truncate">{opp.product?.title}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{opp.retailStoreName}</td>
                    <td className="py-3 px-4 text-sm font-medium">${opp.buyPrice?.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm font-medium">${opp.sellPrice?.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-green-600">${opp.estimatedProfit?.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${opp.estimatedRoi >= 30 ? 'text-green-700 bg-green-50' : 'text-yellow-700 bg-yellow-50'}`}>
                        {opp.estimatedRoi?.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${opp.overallScore}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{opp.overallScore?.toFixed(0)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${riskColors[opp.riskLevel] ?? 'bg-gray-100 text-gray-600'}`}>
                        {opp.riskLevel?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${recColors[opp.aiRecommendation] ?? 'bg-gray-100 text-gray-600'}`}>
                        {opp.aiRecommendation?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/opportunities/${opp.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {meta.page} of {meta.pages} ({meta.total} total)</p>
            <div className="flex gap-2">
              <button disabled={meta.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50">Previous</button>
              <button disabled={meta.page >= meta.pages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
