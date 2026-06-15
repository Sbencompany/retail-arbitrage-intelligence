'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunitiesApi, profitabilityApi, freightApi } from '@/lib/api';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingCart, X, BarChart2, Truck } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: oppData, isLoading } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => opportunitiesApi.get(id as string).then((r: any) => r.data),
  });

  const dismissMutation = useMutation({
    mutationFn: () => opportunitiesApi.dismiss(id as string),
    onSuccess: () => {
      toast.success('Opportunity dismissed');
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: () => opportunitiesApi.purchase(id as string),
    onSuccess: () => toast.success('Marked as purchased!'),
  });

  if (isLoading) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>;
  }

  const opp = oppData;
  if (!opp) return <div className="p-8 text-center text-gray-500">Opportunity not found</div>;

  const priceHistory = opp.product?.priceHistory ?? [];
  const riskColors: Record<string, string> = {
    VERY_LOW: 'text-green-600', LOW: 'text-green-500', MEDIUM: 'text-yellow-600', HIGH: 'text-red-500', VERY_HIGH: 'text-red-600'
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/opportunities" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900 truncate">{opp.product?.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex gap-4">
              {opp.product?.imageUrl && (
                <img src={opp.product.imageUrl} className="w-24 h-24 object-contain rounded-xl bg-gray-50" onError={e => (e.currentTarget.style.display = 'none')} />
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{opp.product?.title}</p>
                <p className="text-gray-500 text-sm mt-1">{opp.product?.brand} · {opp.product?.category}</p>
                {opp.product?.upc && <p className="text-xs text-gray-400 mt-1">UPC: {opp.product.upc}</p>}
                {opp.product?.asin && <p className="text-xs text-gray-400">ASIN: {opp.product.asin}</p>}
              </div>
            </div>
          </div>

          {/* Financial breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><BarChart2 size={18} className="text-blue-600" /> Financial Analysis</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-700">${opp.buyPrice?.toFixed(2)}</p>
                <p className="text-xs text-blue-600 mt-1">Buy Price</p>
                <p className="text-xs text-gray-500">{opp.retailStoreName}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-700">${opp.sellPrice?.toFixed(2)}</p>
                <p className="text-xs text-green-600 mt-1">Sell Price</p>
                <p className="text-xs text-gray-500">{opp.targetMarketplace}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <p className="text-2xl font-bold text-purple-700">${opp.estimatedProfit?.toFixed(2)}</p>
                <p className="text-xs text-purple-600 mt-1">Net Profit</p>
                <p className="text-xs text-gray-500">per unit</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'ROI', value: `${opp.estimatedRoi?.toFixed(1)}%`, color: 'text-green-600' },
                { label: 'Margin', value: `${opp.estimatedMargin?.toFixed(1)}%`, color: 'text-blue-600' },
                { label: 'Demand', value: `${opp.demandScore?.toFixed(0)}/100`, color: 'text-orange-600' },
                { label: 'Score', value: `${opp.overallScore?.toFixed(0)}/100`, color: 'text-purple-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center p-3 border border-gray-100 rounded-xl">
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          {opp.aiSummary && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🤖</span>
                <h2 className="font-semibold text-gray-900">AI Analysis</h2>
                <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${
                  opp.aiRecommendation === 'STRONG_BUY' || opp.aiRecommendation === 'BUY' ? 'bg-green-100 text-green-800' :
                  opp.aiRecommendation === 'AVOID' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>{opp.aiRecommendation?.replace('_', ' ')}</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{opp.aiSummary}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Recommended Quantity</p>
                  <p className="text-lg font-bold text-gray-900">{opp.recommendedQuantity} units</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Est. Days to Sell</p>
                  <p className="text-lg font-bold text-gray-900">{opp.estimatedDaysToSell} days</p>
                </div>
              </div>
            </div>
          )}

          {/* Price History Chart */}
          {priceHistory.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Price History</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={priceHistory.slice(0, 30).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="recordedAt" tick={{ fontSize: 10 }} tickFormatter={d => new Date(d).toLocaleDateString()} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Price']} />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Risk */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Risk Assessment</h3>
            <p className={`text-lg font-bold ${riskColors[opp.riskLevel] ?? 'text-gray-900'}`}>{opp.riskLevel?.replace('_', ' ')}</p>
            <p className="text-xs text-gray-500 mt-1">Fulfillment: {opp.fulfillmentMethod}</p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => purchaseMutation.mutate()}
              disabled={purchaseMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              <ShoppingCart size={18} />
              Mark as Purchased
            </button>
            <button
              onClick={() => dismissMutation.mutate()}
              disabled={dismissMutation.isPending}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl transition-colors"
            >
              <X size={18} />
              Dismiss
            </button>
          </div>

          {/* Marketplace links */}
          {opp.product?.asin && (
            <a href={`https://www.amazon.com/dp/${opp.product.asin}`} target="_blank" rel="noopener noreferrer"
              className="block w-full text-center border border-orange-200 text-orange-600 hover:bg-orange-50 py-2 px-4 rounded-xl text-sm font-medium transition-colors">
              View on Amazon →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
