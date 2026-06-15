'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { profitabilityApi, freightApi } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { Calculator, Truck, TrendingUp } from 'lucide-react';

export default function AnalysisPage() {
  const [profResult, setProfResult] = useState<any>(null);
  const [freightResult, setFreightResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profit' | 'freight' | 'compare'>('profit');

  const { register: profRegister, handleSubmit: profSubmit } = useForm({
    defaultValues: { purchasePrice: 10, salePrice: 29.99, marketplace: 'AMAZON', fulfillmentMethod: 'FBA', weightLbs: 1, category: 'Electronics' }
  });

  const { register: freightReg, handleSubmit: freightSub } = useForm({
    defaultValues: { originZip: '10001', destZip: '90210', weightLbs: 2, lengthIn: 12, widthIn: 8, heightIn: 6 }
  });

  const profMutation = useMutation({
    mutationFn: (data: any) => profitabilityApi.calculate(data).then((r: any) => r.data),
    onSuccess: setProfResult,
  });

  const freightMutation = useMutation({
    mutationFn: (data: any) => freightApi.quotes(data).then((r: any) => r.data),
    onSuccess: setFreightResult,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analysis Tools</h1>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 rounded-xl p-1 w-fit">
        {([['profit', 'Profitability', Calculator], ['freight', 'Freight', Truck]] as any[]).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {activeTab === 'profit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Profitability Calculator</h2>
            <form onSubmit={profSubmit(d => profMutation.mutate(d))} className="space-y-3">
              {[
                { name: 'purchasePrice', label: 'Purchase Price ($)', type: 'number', step: '0.01' },
                { name: 'salePrice', label: 'Sale Price ($)', type: 'number', step: '0.01' },
                { name: 'weightLbs', label: 'Weight (lbs)', type: 'number', step: '0.1' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm text-gray-600 mb-1">{f.label}</label>
                  <input {...profRegister(f.name as any)} type={f.type} step={f.step} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Marketplace</label>
                <select {...profRegister('marketplace')} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="AMAZON">Amazon</option>
                  <option value="WALMART">Walmart</option>
                  <option value="EBAY">eBay</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Fulfillment</label>
                <select {...profRegister('fulfillmentMethod')} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="FBA">Amazon FBA</option>
                  <option value="FBM">Amazon FBM</option>
                  <option value="WALMART_WFS">Walmart WFS</option>
                  <option value="EBAY_STANDARD">eBay Standard</option>
                </select>
              </div>
              <button type="submit" disabled={profMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
                {profMutation.isPending ? 'Calculating...' : 'Calculate'}
              </button>
            </form>
          </div>

          {profResult && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-600" /> Results
                <span className={`ml-auto text-sm font-bold px-2 py-1 rounded-full ${profResult.isViable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {profResult.isViable ? '✅ Viable' : '❌ Not Viable'}
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Net Profit', value: `$${profResult.netProfit?.toFixed(2)}`, highlight: true },
                  { label: 'ROI', value: `${profResult.roi?.toFixed(1)}%`, highlight: true },
                  { label: 'Margin', value: `${profResult.margin?.toFixed(1)}%` },
                  { label: 'Referral Fee', value: `$${profResult.referralFee?.toFixed(2)}` },
                  { label: 'Fulfillment Fee', value: `$${profResult.fulfillmentFee?.toFixed(2)}` },
                  { label: 'Shipping Cost', value: `$${profResult.shippingCost?.toFixed(2)}` },
                  { label: 'Total Cost', value: `$${profResult.totalCost?.toFixed(2)}` },
                  { label: 'Break Even', value: `$${profResult.breakEvenPrice?.toFixed(2)}` },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className={`p-3 rounded-xl ${highlight ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className={`font-bold mt-0.5 ${highlight ? 'text-blue-700 text-lg' : 'text-gray-900'}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'freight' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Freight Calculator</h2>
            <form onSubmit={freightSub(d => freightMutation.mutate(d))} className="space-y-3">
              {[
                { name: 'originZip', label: 'Origin ZIP', type: 'text' },
                { name: 'destZip', label: 'Destination ZIP', type: 'text' },
                { name: 'weightLbs', label: 'Weight (lbs)', type: 'number', step: '0.1' },
                { name: 'lengthIn', label: 'Length (inches)', type: 'number' },
                { name: 'widthIn', label: 'Width (inches)', type: 'number' },
                { name: 'heightIn', label: 'Height (inches)', type: 'number' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm text-gray-600 mb-1">{f.label}</label>
                  <input {...freightReg(f.name as any)} type={f.type} step={f.step} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              ))}
              <button type="submit" disabled={freightMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
                {freightMutation.isPending ? 'Getting quotes...' : 'Get Quotes'}
              </button>
            </form>
          </div>

          {freightResult && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Shipping Quotes</h2>
              <div className="space-y-2">
                {(Array.isArray(freightResult) ? freightResult : []).map((q: any, i: number) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${i === 0 ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                    <div>
                      {i === 0 && <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded mr-2">Cheapest</span>}
                      <span className="text-sm font-medium text-gray-900">{q.carrier}</span>
                      <span className="text-xs text-gray-500 ml-2">{q.service}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${q.rate?.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{q.estimatedDays} days</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
