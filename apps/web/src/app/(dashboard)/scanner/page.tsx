'use client';
import { useMutation } from '@tanstack/react-query';
import { dealDiscoveryApi } from '@/lib/api';
import { useState } from 'react';
import { toast } from 'sonner';
import { Zap, Store } from 'lucide-react';

const stores = [
  { slug: 'walmart', name: 'Walmart', emoji: '🛒', hasApi: true },
  { slug: 'bestbuy', name: 'Best Buy', emoji: '🖥️', hasApi: true },
  { slug: 'target', name: 'Target', emoji: '🎯', hasApi: false },
  { slug: 'costco', name: 'Costco', emoji: '📦', hasApi: false },
  { slug: 'homedepot', name: 'Home Depot', emoji: '🔨', hasApi: false },
  { slug: 'lowes', name: "Lowe's", emoji: '🏡', hasApi: false },
  { slug: 'cvs', name: 'CVS', emoji: '💊', hasApi: false },
  { slug: 'walgreens', name: 'Walgreens', emoji: '🏥', hasApi: false },
  { slug: 'kohls', name: "Kohl's", emoji: '👗', hasApi: false },
  { slug: 'macys', name: "Macy's", emoji: '👠', hasApi: false },
];

export default function ScannerPage() {
  const [scanResults, setScanResults] = useState<any>(null);

  const fullScanMutation = useMutation({
    mutationFn: () => dealDiscoveryApi.triggerScan().then((r: any) => r.data),
    onSuccess: () => toast.success('Full scan queued! Results will appear in opportunities.'),
    onError: () => toast.error('Scan requires admin/analyst role'),
  });

  const storeScanMutation = useMutation({
    mutationFn: (slug: string) => dealDiscoveryApi.scanStore(slug).then((r: any) => r.data),
    onSuccess: (data) => {
      setScanResults(data);
      toast.success(`Scan complete: ${Array.isArray(data) ? data.length : 0} deals found`);
    },
    onError: () => toast.error('Scan failed'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Deal Scanner</h1>
        <p className="text-gray-500 text-sm">Scan retail stores for arbitrage opportunities</p>
      </div>

      {/* Full Scan */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Full Store Scan</h2>
            <p className="text-blue-100 text-sm mt-1">Scan all {stores.length} retail stores simultaneously</p>
          </div>
          <button
            onClick={() => fullScanMutation.mutate()}
            disabled={fullScanMutation.isPending}
            className="flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <Zap size={18} />
            {fullScanMutation.isPending ? 'Scanning...' : 'Scan All'}
          </button>
        </div>
      </div>

      {/* Individual stores */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Individual Store Scans</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {stores.map(store => (
            <button
              key={store.slug}
              onClick={() => storeScanMutation.mutate(store.slug)}
              disabled={storeScanMutation.isPending}
              className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{store.emoji}</span>
                {store.hasApi ? (
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">API</span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Limited</span>
                )}
              </div>
              <p className="font-medium text-gray-900 text-sm">{store.name}</p>
              <p className="text-xs text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to scan →</p>
            </button>
          ))}
        </div>
      </div>

      {/* Scan Results */}
      {scanResults && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Scan Results ({Array.isArray(scanResults) ? scanResults.length : 0} deals)</h2>
          {Array.isArray(scanResults) && scanResults.length > 0 ? (
            <div className="space-y-2">
              {scanResults.map((deal: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                    <p className="text-xs text-gray-500">{deal.category} · {deal.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">${deal.salePrice?.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 line-through">${deal.originalPrice?.toFixed(2)}</p>
                    <p className="text-xs text-orange-600 font-medium">{deal.discountPercent}% off</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No deals found or scan queued for processing.</p>
          )}
        </div>
      )}
    </div>
  );
}
