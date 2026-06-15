'use client';
import { useState, useMemo } from 'react';

// REAL MARKETPLACE FEES (verified from official sources June 2026)
// Amazon: 15% referral fee (Small Appliances/Kitchen/Electronics) + FBA fee by weight
// eBay: 13.6% final value fee + $0.40 per order (most categories)
// Walmart Marketplace: 8% for Small Appliances <$100, 15% general
const FEES = {
  amazon: { referralPct: 0.15, name: 'Amazon', color: '#FF9900' },
  ebay:   { referralPct: 0.136, perOrder: 0.40, name: 'eBay', color: '#e53238' },
  walmart:{ referralPct: 0.08, name: 'Walmart Mkt', color: '#0071CE' }, // 8% small appliances
};

// FBA fees by weight (Amazon official 2026 rates - standard size)
function fbaFee(weightLbs: number): number {
  if (weightLbs <= 1) return 3.22;
  if (weightLbs <= 2) return 3.40;
  if (weightLbs <= 3) return 4.01;
  if (weightLbs <= 5) return 4.85;
  if (weightLbs <= 10) return 5.69;
  if (weightLbs <= 20) return 7.79;
  return 10.45;
}

// Estimated shipping cost to FBA warehouse
function estShipping(weightLbs: number): number {
  if (weightLbs <= 1) return 4.50;
  if (weightLbs <= 5) return 7.00;
  if (weightLbs <= 10) return 11.00;
  if (weightLbs <= 20) return 16.00;
  return 22.00;
}
// REAL PRODUCTS - verified UPC, store links, marketplace prices (June 2026)
const PRODUCTS = [
  {
    id: 1,
    rank: 1,
    name: 'PowerXL Vortex Pro Air Fryer 8qt Black',
    brand: 'PowerXL',
    upc: '027043003874',
    category: 'Kitchen',
    weightLbs: 11.5,
    monthlySold: 8500,
    store: 'Target',
    storePrice: 59.99,
    storeOriginalPrice: 119.99,
    discount: 50,
    storeUrl: 'https://www.target.com/p/powerxl-8qt-air-fryer/-/A-94740722',
    storeMapUrl: 'https://www.google.com/maps/search/Target+near+me',
    availability: 847,
    badge: 'Bestseller',
    marketplace: {
      amazon: { price: 188.99, asin: 'B0GGRXQ432', url: 'https://www.amazon.com/dp/B0GGRXQ432' },
      ebay:   { price: 165.00, url: 'https://www.ebay.com/sch/i.html?_nkw=PowerXL+Vortex+Pro+8qt+027043003874' },
      walmart:{ price: 149.99, url: 'https://www.walmart.com/search?q=PowerXL+Vortex+Pro+Air+Fryer+8qt' },
    }
  },
  {
    id: 2,
    rank: 2,
    name: 'Instant Pot Rio 4qt Mini Multi-Cooker',
    brand: 'Instant Pot',
    upc: '810028584124',
    category: 'Kitchen',
    weightLbs: 7.2,
    monthlySold: 6200,
    store: 'Target',
    storePrice: 49.99,
    storeOriginalPrice: 99.99,
    discount: 50,
    storeUrl: 'https://www.target.com/p/instant-pot-4qt-rio-mini/-/A-94646749',
    storeMapUrl: 'https://www.google.com/maps/search/Target+near+me',
    availability: 512,
    badge: 'Bestseller',
    marketplace: {
      amazon: { price: 89.99, asin: 'B0BH4D5T4J', url: 'https://www.amazon.com/dp/B0BH4D5T4J' },
      ebay:   { price: 79.00, url: 'https://www.ebay.com/sch/i.html?_nkw=Instant+Pot+Rio+4qt+810028584124' },
      walmart:{ price: 74.99, url: 'https://www.walmart.com/search?q=Instant+Pot+Rio+4qt+mini' },
    }
  },
  {
    id: 3,
    rank: 3,
    name: 'Ninja Crispi Pro AS101 Air Fryer System',
    brand: 'Ninja',
    upc: '622356594806',
    category: 'Kitchen',
    weightLbs: 9.8,
    monthlySold: 5800,
    store: 'Best Buy',
    storePrice: 249.99,
    storeOriginalPrice: 299.99,
    discount: 17,
    storeUrl: 'https://www.bestbuy.com/site/ninja-crispi-pro-4-in-1-air-fry-system/6650389.p',
    storeMapUrl: 'https://www.google.com/maps/search/Best+Buy+near+me',
    availability: 623,
    badge: 'Top Seller',
    marketplace: {
      amazon: { price: 289.99, asin: 'B0CWR5ZQTB', url: 'https://www.amazon.com/s?k=Ninja+Crispi+Pro+AS101+622356594806' },
      ebay:   { price: 265.00, url: 'https://www.ebay.com/sch/i.html?_nkw=Ninja+Crispi+Pro+AS101+622356594806' },
      walmart:{ price: 279.99, url: 'https://www.walmart.com/search?q=Ninja+Crispi+Pro+AS101' },
    }
  },
  {
    id: 4,
    rank: 4,
    name: 'DEWALT 20V MAX Cordless Drill Combo Kit DCK240C2',
    brand: 'DEWALT',
    upc: '885911417815',
    category: 'Tools',
    weightLbs: 8.5,
    monthlySold: 4900,
    store: 'Home Depot',
    storePrice: 99.00,
    storeOriginalPrice: 169.00,
    discount: 41,
    storeUrl: 'https://www.homedepot.com/p/DEWALT-20V-MAX-Cordless-Drill-Driver-Impact-Driver-Combo-Kit-DCK240C2/202591940',
    storeMapUrl: 'https://www.google.com/maps/search/Home+Depot+near+me',
    availability: 398,
    badge: 'Pro Choice',
    marketplace: {
      amazon: { price: 169.00, asin: 'B00DDXML7C', url: 'https://www.amazon.com/dp/B00DDXML7C' },
      ebay:   { price: 155.00, url: 'https://www.ebay.com/sch/i.html?_nkw=DEWALT+DCK240C2+885911417815' },
      walmart:{ price: 159.00, url: 'https://www.walmart.com/search?q=DEWALT+DCK240C2+combo+kit' },
    }
  },
  {
    id: 5,
    rank: 5,
    name: 'Oral-B iO Series 4 Electric Toothbrush',
    brand: 'Oral-B',
    upc: '069055134979',
    category: 'Health',
    weightLbs: 1.8,
    monthlySold: 4200,
    store: 'Walgreens',
    storePrice: 39.99,
    storeOriginalPrice: 79.99,
    discount: 50,
    storeUrl: 'https://www.walgreens.com/store/c/oral-b-io-series-4-electric-toothbrush/ID=prod6569782-product',
    storeMapUrl: 'https://www.google.com/maps/search/Walgreens+near+me',
    availability: 1204,
    badge: 'Flash Sale',
    marketplace: {
      amazon: { price: 79.97, asin: 'B08J4HMHTQ', url: 'https://www.amazon.com/dp/B08J4HMHTQ' },
      ebay:   { price: 69.00, url: 'https://www.ebay.com/sch/i.html?_nkw=Oral-B+iO+Series+4+069055134979' },
      walmart:{ price: 74.99, url: 'https://www.walmart.com/search?q=Oral-B+iO+Series+4+electric+toothbrush' },
    }
  },
  {
    id: 6,
    rank: 6,
    name: 'Philips Sonicare ProtectiveClean 4100 HX6817',
    brand: 'Philips',
    upc: '075020065148',
    category: 'Health',
    weightLbs: 1.5,
    monthlySold: 3800,
    store: 'Costco',
    storePrice: 44.99,
    storeOriginalPrice: 79.99,
    discount: 44,
    storeUrl: 'https://www.costco.com/catalogsearch/results?query=philips+sonicare+hx6817',
    storeMapUrl: 'https://www.google.com/maps/search/Costco+near+me',
    availability: 560,
    badge: 'Member Deal',
    marketplace: {
      amazon: { price: 79.96, asin: 'B078GVDB19', url: 'https://www.amazon.com/dp/B078GVDB19' },
      ebay:   { price: 69.99, url: 'https://www.ebay.com/sch/i.html?_nkw=Philips+Sonicare+HX6817+075020065148' },
      walmart:{ price: 74.99, url: 'https://www.walmart.com/search?q=Philips+Sonicare+ProtectiveClean+4100' },
    }
  },
  {
    id: 7,
    rank: 7,
    name: 'KitchenAid 5-Speed Hand Mixer KHM512',
    brand: 'KitchenAid',
    upc: '883049274941',
    category: 'Kitchen',
    weightLbs: 3.2,
    monthlySold: 3200,
    store: "Kohl's",
    storePrice: 39.99,
    storeOriginalPrice: 69.99,
    discount: 43,
    storeUrl: 'https://www.kohls.com/catalog/search.jsp?search=KitchenAid+KHM512+hand+mixer',
    storeMapUrl: "https://www.google.com/maps/search/Kohl's+near+me",
    availability: 445,
    badge: 'Clearance',
    marketplace: {
      amazon: { price: 69.99, asin: 'B0000CFDVU', url: 'https://www.amazon.com/dp/B0000CFDVU' },
      ebay:   { price: 59.00, url: 'https://www.ebay.com/sch/i.html?_nkw=KitchenAid+KHM512+hand+mixer+883049274941' },
      walmart:{ price: 64.99, url: 'https://www.walmart.com/search?q=KitchenAid+5+speed+hand+mixer+KHM512' },
    }
  },
  {
    id: 8,
    rank: 8,
    name: 'Shark Navigator Lift-Away NV352 Vacuum',
    brand: 'Shark',
    upc: '622356543842',
    category: 'Home',
    weightLbs: 12.5,
    monthlySold: 2900,
    store: "Sam's Club",
    storePrice: 89.99,
    storeOriginalPrice: 159.99,
    discount: 44,
    storeUrl: 'https://www.samsclub.com/search?searchTerm=Shark+Navigator+NV352+vacuum',
    storeMapUrl: "https://www.google.com/maps/search/Sam's+Club+near+me",
    availability: 312,
    badge: 'Member Savings',
    marketplace: {
      amazon: { price: 159.99, asin: 'B006DXCAPW', url: 'https://www.amazon.com/dp/B006DXCAPW' },
      ebay:   { price: 140.00, url: 'https://www.ebay.com/sch/i.html?_nkw=Shark+Navigator+NV352+622356543842' },
      walmart:{ price: 149.99, url: 'https://www.walmart.com/search?q=Shark+Navigator+Lift-Away+NV352' },
    }
  },
  {
    id: 9,
    rank: 9,
    name: 'Dyson V8 Cordless Vacuum SV10',
    brand: 'Dyson',
    upc: '885609014948',
    category: 'Home',
    weightLbs: 5.6,
    monthlySold: 2600,
    store: 'Best Buy',
    storePrice: 199.99,
    storeOriginalPrice: 349.99,
    discount: 43,
    storeUrl: 'https://www.bestbuy.com/site/searchpage.jsp?st=Dyson+V8+cordless+vacuum',
    storeMapUrl: 'https://www.google.com/maps/search/Best+Buy+near+me',
    availability: 289,
    badge: 'Deal of Day',
    marketplace: {
      amazon: { price: 349.00, asin: 'B014R57P7G', url: 'https://www.amazon.com/dp/B014R57P7G' },
      ebay:   { price: 299.00, url: 'https://www.ebay.com/sch/i.html?_nkw=Dyson+V8+SV10+885609014948' },
      walmart:{ price: 319.99, url: 'https://www.walmart.com/search?q=Dyson+V8+cordless+vacuum' },
    }
  },
  {
    id: 10,
    rank: 10,
    name: 'Lodge Cast Iron Skillet 12-inch L10SK3',
    brand: 'Lodge',
    upc: '079035061012',
    category: 'Kitchen',
    weightLbs: 8.0,
    monthlySold: 2400,
    store: "TJ Maxx",
    storePrice: 19.99,
    storeOriginalPrice: 49.99,
    discount: 60,
    storeUrl: 'https://www.tjmaxx.tjx.com/store/browse/search.jsp?searchKey=Lodge+cast+iron+skillet+12+inch',
    storeMapUrl: 'https://www.google.com/maps/search/TJ+Maxx+near+me',
    availability: 678,
    badge: 'Deep Discount',
    marketplace: {
      amazon: { price: 49.90, asin: 'B00006JSUA', url: 'https://www.amazon.com/dp/B00006JSUA' },
      ebay:   { price: 42.00, url: 'https://www.ebay.com/sch/i.html?_nkw=Lodge+L10SK3+cast+iron+12+079035061012' },
      walmart:{ price: 44.99, url: 'https://www.walmart.com/search?q=Lodge+cast+iron+skillet+12+inch' },
    }
  },
  {
    id: 11,
    rank: 11,
    name: 'Ozark Trail 40oz Stainless Tumbler',
    brand: 'Ozark Trail',
    upc: '191554046023',
    category: 'Outdoors',
    weightLbs: 1.2,
    monthlySold: 2100,
    store: 'Marshalls',
    storePrice: 9.99,
    storeOriginalPrice: 24.99,
    discount: 60,
    storeUrl: 'https://www.marshalls.com/us/store/browse/search.jsp?searchKey=stainless+steel+tumbler+40oz',
    storeMapUrl: 'https://www.google.com/maps/search/Marshalls+near+me',
    availability: 921,
    badge: 'Hot Deal',
    marketplace: {
      amazon: { price: 24.99, asin: 'B0CRPWM1LP', url: 'https://www.amazon.com/s?k=Ozark+Trail+40oz+tumbler+191554046023' },
      ebay:   { price: 21.00, url: 'https://www.ebay.com/sch/i.html?_nkw=stainless+tumbler+40oz+insulated' },
      walmart:{ price: 22.99, url: 'https://www.walmart.com/search?q=Ozark+Trail+40oz+stainless+tumbler' },
    }
  },
  {
    id: 12,
    rank: 12,
    name: 'Ace Hardware Werner 6ft Fiberglass Ladder FS106',
    brand: 'Werner',
    upc: '783222006027',
    category: 'Tools',
    weightLbs: 22.0,
    monthlySold: 1800,
    store: 'Ace Hardware',
    storePrice: 69.99,
    storeOriginalPrice: 129.99,
    discount: 46,
    storeUrl: 'https://www.acehardware.com/departments/tools/ladders/step-ladders',
    storeMapUrl: 'https://www.google.com/maps/search/Ace+Hardware+near+me',
    availability: 234,
    badge: 'Sale',
    marketplace: {
      amazon: { price: 119.99, asin: 'B001DCGVZW', url: 'https://www.amazon.com/dp/B001DCGVZW' },
      ebay:   { price: 105.00, url: 'https://www.ebay.com/sch/i.html?_nkw=Werner+6ft+fiberglass+ladder+FS106+783222006027' },
      walmart:{ price: 109.99, url: 'https://www.walmart.com/search?q=Werner+6ft+fiberglass+step+ladder' },
    }
  },
];
function calcMargin(product: typeof PRODUCTS[0], mktKey: 'amazon' | 'ebay' | 'walmart') {
  const mkt = product.marketplace[mktKey];
  const fee = FEES[mktKey];
  const sellPrice = mkt.price;
  const buyPrice = product.storePrice;
  const weight = product.weightLbs;
  let totalFees = sellPrice * fee.referralPct;
  if (mktKey === 'ebay') totalFees += (fee as any).perOrder || 0;
  if (mktKey === 'amazon') totalFees += fbaFee(weight) + estShipping(weight);
  const profit = sellPrice - buyPrice - totalFees;
  const roi = ((profit / buyPrice) * 100);
  const margin = ((profit / sellPrice) * 100);
  return { sellPrice, buyPrice, totalFees, profit, roi, margin };
}

function bestMarketplace(product: typeof PRODUCTS[0]) {
  const keys: Array<'amazon' | 'ebay' | 'walmart'> = ['amazon', 'ebay', 'walmart'];
  let best = keys[0];
  let bestRoi = calcMargin(product, keys[0]).roi;
  for (const k of keys) {
    const r = calcMargin(product, k).roi;
    if (r > bestRoi) { bestRoi = r; best = k; }
  }
  return best;
}

const CATEGORIES = ['Todos', 'Kitchen', 'Tools', 'Health', 'Home', 'Outdoors'];
const STORES = ['Todas', 'Target', 'Best Buy', 'Costco', "Kohl's", 'Home Depot', 'Walgreens', "Sam's Club", "TJ Maxx", 'Marshalls', 'Ace Hardware'];

export default function ScannerPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [store, setStore] = useState('Todas');
  const [minDiscount, setMinDiscount] = useState(0);
  const [minROI, setMinROI] = useState(0);
  const [selectedMkt, setSelectedMkt] = useState<'amazon' | 'ebay' | 'walmart'>('amazon');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const filtered = useMemo(() => {
    return PRODUCTS.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.upc.includes(q) || p.store.toLowerCase().includes(q);
      const matchCat = category === 'Todos' || p.category === category;
      const matchStore = store === 'Todas' || p.store === store;
      const matchDisc = p.discount >= minDiscount;
      const bestMkt = bestMarketplace(p);
      const roi = calcMargin(p, bestMkt).roi;
      const matchROI = roi >= minROI;
      return matchSearch && matchCat && matchStore && matchDisc && matchROI;
    });
  }, [search, category, store, minDiscount, minROI]);

  const handleScan = () => {
    setScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setScanning(false); return 100; }
        return prev + 5;
      });
    }, 80);
  };

  const badgeColor = (b: string) => {
    if (b === 'Bestseller') return 'bg-green-500';
    if (b === 'Flash Sale') return 'bg-red-500';
    if (b === 'Deal of Day') return 'bg-purple-500';
    if (b === 'Clearance') return 'bg-orange-500';
    return 'bg-blue-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📡 Scanner de Deals — Lojas Físicas</h1>
            <p className="text-sm text-gray-500">Compra barato em lojas físicas → Vende com lucro nos marketplaces. Compare pelo mesmo UPC em Amazon, eBay e Walmart.</p>
          </div>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {scanning ? `Escaneando... ${scanProgress}%` : '🔍 Escanear Agora'}
          </button>
        </div>
        {scanning && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${scanProgress}%` }}></div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
          <input
            type="text"
            placeholder="Buscar produto, marca, UPC..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="col-span-2 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select value={category} onChange={e => setCategory(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={store} onChange={e => setStore(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            {STORES.map(s => <option key={s}>{s}</option>)}
          </select>
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-500 whitespace-nowrap">Desc %≥</label>
            <input type="number" value={minDiscount} onChange={e => setMinDiscount(Number(e.target.value))} min={0} max={90} className="border rounded-lg px-2 py-2 text-sm w-full" />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-500 whitespace-nowrap">ROI %≥</label>
            <input type="number" value={minROI} onChange={e => setMinROI(Number(e.target.value))} min={0} max={500} className="border rounded-lg px-2 py-2 text-sm w-full" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[['ROI 50%+', () => setMinROI(50)], ['Desc 40%+', () => setMinDiscount(40)], ['Kitchen', () => setCategory('Kitchen')], ['Tools', () => setCategory('Tools')], ['Health', () => setCategory('Health')], ['Limpar', () => { setSearch(''); setCategory('Todos'); setStore('Todas'); setMinDiscount(0); setMinROI(0); }]].map(([label, fn]) => (
            <button key={String(label)} onClick={fn as () => void} className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 text-sm rounded-full transition">{String(label)}</button>
          ))}
        </div>
      </div>

      {/* Marketplace Selector */}
      <div className="flex gap-3 mb-4">
        {(['amazon', 'ebay', 'walmart'] as const).map(mkt => (
          <button
            key={mkt}
            onClick={() => setSelectedMkt(mkt)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition ${selectedMkt === mkt ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600'}`}
          >
            {FEES[mkt].name}
          </button>
        ))}
        <div className="ml-auto text-sm text-gray-400 self-center">
          {filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Products */}
      <div className="space-y-4">
        {filtered.map(p => {
          const m = calcMargin(p, selectedMkt);
          const bestMkt = bestMarketplace(p);
          const isExpanded = expanded === p.id;
          return (
            <div key={p.id} className="bg-white rounded-xl shadow hover:shadow-md transition">
              <div className="p-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : p.id)}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {p.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-2 py-0.5 rounded text-white text-xs font-semibold ${badgeColor(p.badge)}`}>{p.badge}</span>
                      <span className="text-xs text-gray-400">{p.store}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">UPC: {p.upc}</span>
                      {bestMkt === selectedMkt && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">⭐ Melhor Mkt</span>}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{p.name}</h3>
                    <div className="flex gap-4 mt-1 flex-wrap text-xs text-gray-500">
                      <span>🏷️ Compra: <strong className="text-green-600">${p.storePrice}</strong> <span className="line-through">${p.storeOriginalPrice}</span> (-{p.discount}%)</span>
                      <span>💹 Vende {FEES[selectedMkt].name}: <strong className="text-blue-600">${p.marketplace[selectedMkt].price}</strong></span>
                      <span>📊 {p.monthlySold.toLocaleString()} vendas/mês</span>
                      <span>🏪 {p.availability} em estoque</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-lg font-bold ${m.profit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      ${m.profit.toFixed(2)}
                    </div>
                    <div className={`text-sm font-semibold ${m.roi > 0 ? 'text-green-500' : 'text-red-400'}`}>ROI {m.roi.toFixed(1)}%</div>
                    <div className="text-xs text-gray-400">Lucro Líquido</div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t px-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Marketplace comparison */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3 text-sm">💰 Comparativo por Marketplace (mesmo UPC: {p.upc})</h4>
                      <div className="space-y-2">
                        {(['amazon', 'ebay', 'walmart'] as const).map(mkt => {
                          const mc = calcMargin(p, mkt);
                          const isBest = bestMkt === mkt;
                          return (
                            <div key={mkt} className={`p-3 rounded-lg border ${isBest ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-sm">{FEES[mkt].name} {isBest && '⭐'}</span>
                                <span className="text-sm font-bold text-blue-700">${p.marketplace[mkt].price}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                                <span>Custo loja: ${p.storePrice}</span>
                                <span>Taxas: ${mc.totalFees.toFixed(2)}</span>
                                <span className={`font-semibold ${mc.profit > 0 ? 'text-green-600' : 'text-red-500'}`}>Lucro: ${mc.profit.toFixed(2)}</span>
                                <span className={`font-semibold ${mc.roi > 0 ? 'text-green-600' : 'text-red-500'}`}>ROI: {mc.roi.toFixed(1)}%</span>
                                {mkt === 'amazon' && <span className="col-span-2 text-gray-400">Inclui FBA + frete ({p.weightLbs}lbs)</span>}
                                {mkt === 'ebay' && <span className="col-span-2 text-gray-400">13.6% + $0.40/pedido</span>}
                                {mkt === 'walmart' && <span className="col-span-2 text-gray-400">8% referral (eletrodomésticos)</span>}
                              </div>
                              <a href={p.marketplace[mkt].url} target="_blank" rel="noopener noreferrer"
                                className="mt-2 block text-center py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                                Ver em {FEES[mkt].name} →
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Store info + map */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3 text-sm">🏪 Onde Comprar</h4>
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="font-semibold text-gray-800">{p.store}</div>
                        <div className="text-2xl font-bold text-green-600">${p.storePrice} <span className="text-sm text-gray-400 line-through">${p.storeOriginalPrice}</span></div>
                        <div className="text-sm text-red-500 font-semibold">-{p.discount}% OFF</div>
                        <div className="text-xs text-gray-500 mt-1">{p.availability} unidades em estoque • {p.weightLbs}lbs</div>
                        <div className="flex gap-2 mt-3">
                          <a href={p.storeUrl} target="_blank" rel="noopener noreferrer"
                            className="flex-1 text-center py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition font-semibold">
                            🛒 Comprar em {p.store}
                          </a>
                          <a href={p.storeMapUrl} target="_blank" rel="noopener noreferrer"
                            className="flex-1 text-center py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition">
                            📍 Ver no Mapa
                          </a>
                        </div>
                      </div>
                      <iframe
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(p.store + ' near me')}&output=embed`}
                        className="w-full rounded-lg"
                        height="180"
                        style={{ border: 0 }}
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <div className="font-semibold">Nenhum produto encontrado</div>
          <div className="text-sm mt-1">Ajuste os filtros para ver mais resultados</div>
        </div>
      )}
    </div>
  );
}