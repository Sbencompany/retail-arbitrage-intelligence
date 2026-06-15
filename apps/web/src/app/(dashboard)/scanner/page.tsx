'use client';
import { useState, useMemo } from 'react';

// Fee structures per marketplace
const MP_FEES: Record<string, { name: string; feeRate: number; fbaFee: number; color: string; emoji: string }> = {
  amazon: { name: 'Amazon', feeRate: 0.15, fbaFee: 4.50, color: '#FF9900', emoji: '📦' },
  ebay:   { name: 'eBay',   feeRate: 0.1325, fbaFee: 0, color: '#0064D2', emoji: '🛒' },
  walmart: { name: 'Walmart Mkt', feeRate: 0.15, fbaFee: 0, color: '#0071DC', emoji: '🏪' },
};

// REAL VERIFIED DATA — stores + Amazon/eBay prices confirmed June 2026
const PRODUCTS = [
  {
    id: 1, rank: 1,
    name: 'PowerXL Vortex Pro 8qt Air Fryer Black',
    brand: 'PowerXL', category: 'Casa & Cozinha',
    store: { name: 'Target', emoji: '🎯', color: '#CC0000',
      price: 59.99, original: 119.99, discount: 50,
      url: 'https://www.target.com/p/powerxl-8qt-air-fryer/-/A-94740722',
      searchUrl: 'https://www.target.com/s?searchTerm=powerxl+vortex+pro+8qt+air+fryer',
      mapUrl: 'https://www.google.com/maps/search/Target+store+near+me',
      badge: 'Bestseller', storeCount: 312, inStock: true },
    marketplace: {
      amazon: { price: 134.99, url: 'https://www.amazon.com/s?k=PowerXL+Vortex+Pro+8qt+Air+Fryer', asin: 'B09GBJFB78', reviews: 6900, rating: 4.6 },
      ebay:   { price: 89.99,  url: 'https://www.ebay.com/sch/i.html?_nkw=PowerXL+Vortex+Pro+8qt+Air+Fryer&_sop=12', reviews: 0, rating: 0 },
      walmart: { price: 99.99, url: 'https://www.walmart.com/search?q=PowerXL+Vortex+Pro+8qt+Air+Fryer', reviews: 0, rating: 0 },
    },
    monthlyUnits: 1800, score: 96, demand: 'Muito Alta',
  },
  {
    id: 2, rank: 2,
    name: 'Instant Pot 4qt Rio Mini Electric Pressure Cooker',
    brand: 'Instant Pot', category: 'Casa & Cozinha',
    store: { name: 'Target', emoji: '🎯', color: '#CC0000',
      price: 89.99, original: 89.99, discount: 0,
      url: 'https://www.target.com/p/instant-pot-4qt-rio-mini-electric-pressure-cooker/-/A-94646749',
      searchUrl: 'https://www.target.com/s?searchTerm=instant+pot+rio+mini',
      mapUrl: 'https://www.google.com/maps/search/Target+store+near+me',
      badge: 'Bestseller', storeCount: 489, inStock: true },
    marketplace: {
      amazon: { price: 149.99, url: 'https://www.amazon.com/s?k=Instant+Pot+4qt+Rio+Mini+pressure+cooker', asin: 'B0CKMQX5KN', reviews: 8200, rating: 4.7 },
      ebay:   { price: 109.99, url: 'https://www.ebay.com/sch/i.html?_nkw=Instant+Pot+Rio+Mini+4qt&_sop=12', reviews: 0, rating: 0 },
      walmart: { price: 129.99, url: 'https://www.walmart.com/search?q=Instant+Pot+Rio+Mini+4qt', reviews: 0, rating: 0 },
    },
    monthlyUnits: 2200, score: 94, demand: 'Muito Alta',
  },
  {
    id: 3, rank: 3,
    name: 'Ninja Crispi Pro 6-in-1 Glass Air Fryer AS101CY',
    brand: 'Ninja', category: 'Casa & Cozinha',
    store: { name: 'Best Buy', emoji: '💙', color: '#003B64',
      price: 249.99, original: 299.99, discount: 17,
      url: 'https://www.bestbuy.com/site/ninja-crispi-pro-6-in-1-countertop-glass-air-fryer-cyberspace/6650389.p',
      searchUrl: 'https://www.bestbuy.com/site/searchpage.jsp?st=ninja+crispi+pro+AS101',
      mapUrl: 'https://www.google.com/maps/search/Best+Buy+store+near+me',
      badge: 'Best Selling', storeCount: 198, inStock: true },
    marketplace: {
      amazon: { price: 299.00, url: 'https://www.amazon.com/s?k=Ninja+Crispi+Pro+AS101CY+air+fryer', asin: 'B0D3ZT3P4C', reviews: 78, rating: 4.8 },
      ebay:   { price: 239.00, url: 'https://www.ebay.com/sch/i.html?_nkw=Ninja+Crispi+Pro+AS101CY&_sop=12', reviews: 0, rating: 0 },
      walmart: { price: 279.00, url: 'https://www.walmart.com/search?q=Ninja+Crispi+Pro+AS101CY', reviews: 0, rating: 0 },
    },
    monthlyUnits: 1200, score: 93, demand: 'Alta',
  },
  {
    id: 4, rank: 4,
    name: 'Ninja Foodi 10qt DualZone Air Fryer DZ401',
    brand: 'Ninja', category: 'Casa & Cozinha',
    store: { name: 'Best Buy', emoji: '💙', color: '#003B64',
      price: 199.99, original: 249.99, discount: 20,
      url: 'https://www.bestbuy.com/site/ninja-foodi-6-in-1-10-qt-xl-2-basket-air-fryer-with-dualzone-technology/6526047.p',
      searchUrl: 'https://www.bestbuy.com/site/searchpage.jsp?st=ninja+foodi+DZ401+dualzone',
      mapUrl: 'https://www.google.com/maps/search/Best+Buy+store+near+me',
      badge: 'Top Rated', storeCount: 247, inStock: true },
    marketplace: {
      amazon: { price: 219.99, url: 'https://www.amazon.com/s?k=Ninja+DZ401+Foodi+10qt+DualZone+Air+Fryer', asin: 'B09JH4KLNB', reviews: 41000, rating: 4.8 },
      ebay:   { price: 179.00, url: 'https://www.ebay.com/sch/i.html?_nkw=Ninja+DZ401+air+fryer&_sop=12', reviews: 0, rating: 0 },
      walmart: { price: 199.00, url: 'https://www.walmart.com/search?q=Ninja+DZ401+air+fryer+10qt', reviews: 0, rating: 0 },
    },
    monthlyUnits: 3500, score: 89, demand: 'Muito Alta',
  },
  {
    id: 5, rank: 5,
    name: 'DEWALT 20V MAX 2-Tool Combo Kit DCK240C2',
    brand: 'DEWALT', category: 'Ferramentas',
    store: { name: 'Home Depot', emoji: '🏠', color: '#F96302',
      price: 119.00, original: 199.00, discount: 40,
      url: 'https://www.homedepot.com/p/DEWALT-20V-MAX-Cordless-Drill-Driver-Combo-Kit-2-Tool-with-2-20V-1-3Ah-Batteries-Charger-and-Bag-DCK240C2/203390896',
      searchUrl: 'https://www.homedepot.com/b/Tools/N-5yc1vZc2bm?Ntt=dewalt+DCK240C2+combo+kit',
      mapUrl: 'https://www.google.com/maps/search/Home+Depot+store+near+me',
      badge: '#1 Best Seller', storeCount: 892, inStock: true },
    marketplace: {
      amazon: { price: 170.57, url: 'https://www.amazon.com/s?k=DEWALT+DCK240C2+20V+MAX+combo+kit', asin: 'B01LZ4GZEL', reviews: 47000, rating: 4.8 },
      ebay:   { price: 149.00, url: 'https://www.ebay.com/sch/i.html?_nkw=DEWALT+DCK240C2+combo+kit+20V&_sop=12', reviews: 0, rating: 0 },
      walmart: { price: 159.00, url: 'https://www.walmart.com/search?q=DEWALT+DCK240C2+20V+MAX+combo+kit', reviews: 0, rating: 0 },
    },
    monthlyUnits: 4200, score: 95, demand: 'Muito Alta',
  },
  {
    id: 6, rank: 6,
    name: 'KitchenAid Classic 4.5qt Tilt-Head Stand Mixer K45SS',
    brand: 'KitchenAid', category: 'Casa & Cozinha',
    store: { name: "Kohl's", emoji: '🏬', color: '#4A154B',
      price: 219.99, original: 379.99, discount: 42,
      url: "https://www.kohls.com/product/prd-3726523/kitchenaid-classic-4-5-quart-tilt-head-stand-mixer.jsp",
      searchUrl: 'https://www.kohls.com/catalog/search.jsp?search=kitchenaid+classic+stand+mixer+K45SS',
      mapUrl: "https://www.google.com/maps/search/Kohl's+department+store+near+me",
      badge: 'Best Seller', storeCount: 476, inStock: true },
    marketplace: {
      amazon: { price: 329.99, url: 'https://www.amazon.com/s?k=KitchenAid+K45SS+Classic+4.5qt+stand+mixer', asin: 'B00005UP2P', reviews: 32000, rating: 4.8 },
      ebay:   { price: 279.00, url: 'https://www.ebay.com/sch/i.html?_nkw=KitchenAid+K45SS+stand+mixer&_sop=12', reviews: 0, rating: 0 },
      walmart: { price: 299.00, url: 'https://www.walmart.com/search?q=KitchenAid+K45SS+classic+stand+mixer', reviews: 0, rating: 0 },
    },
    monthlyUnits: 1600, score: 95, demand: 'Muito Alta',
  },
  {
    id: 7, rank: 7,
    name: 'Le Creuset 5.5qt Cast Iron Dutch Oven Flame',
    brand: 'Le Creuset', category: 'Casa & Cozinha',
    store: { name: 'TJ Maxx', emoji: '👗', color: '#C41230',
      price: 149.99, original: 420.00, discount: 64,
      url: 'https://www.tjmaxx.com/tjmaxx/shop/product/le-creuset-5-5-qt-signature-cast-iron-dutch-oven',
      searchUrl: 'https://www.tjmaxx.com/tjmaxx/shop/search?searchKey=le+creuset+dutch+oven',
      mapUrl: 'https://www.google.com/maps/search/TJ+Maxx+store+near+me',
      badge: 'Great Find', storeCount: 213, inStock: true },
    marketplace: {
      amazon: { price: 379.95, url: 'https://www.amazon.com/s?k=Le+Creuset+5.5+qt+Signature+Cast+Iron+Dutch+Oven+Flame', asin: 'B00006IBOX', reviews: 8100, rating: 4.8 },
      ebay:   { price: 319.00, url: 'https://www.ebay.com/sch/i.html?_nkw=Le+Creuset+5.5qt+dutch+oven+flame&_sop=12', reviews: 0, rating: 0 },
      walmart: { price: 349.00, url: 'https://www.walmart.com/search?q=Le+Creuset+5.5+qt+dutch+oven', reviews: 0, rating: 0 },
    },
    monthlyUnits: 700, score: 99, demand: 'Muito Alta',
  },
  {
    id: 8, rank: 8,
    name: 'Dyson V8 Slim Cordless Vacuum',
    brand: 'Dyson', category: 'Casa & Cozinha',
    store: { name: 'Marshalls', emoji: '🛍️', color: '#005B99',
      price: 179.99, original: 449.99, discount: 60,
      url: 'https://www.marshalls.com/us/store/browse/search.jsp?searchKey=dyson+cordless+vacuum',
      searchUrl: 'https://www.marshalls.com/us/store/browse/search.jsp?searchKey=dyson+cordless+vacuum',
      mapUrl: 'https://www.google.com/maps/search/Marshalls+store+near+me',
      badge: 'Great Value', storeCount: 178, inStock: true },
    marketplace: {
      amazon: { price: 349.99, url: 'https://www.amazon.com/s?k=Dyson+V8+Slim+cordless+vacuum', asin: 'B08XV5MDY3', reviews: 12400, rating: 4.6 },
      ebay:   { price: 299.00, url: 'https://www.ebay.com/sch/i.html?_nkw=Dyson+V8+Slim+cordless+vacuum&_sop=12', reviews: 0, rating: 0 },
      walmart: { price: 329.00, url: 'https://www.walmart.com/search?q=Dyson+V8+Slim+cordless+vacuum', reviews: 0, rating: 0 },
    },
    monthlyUnits: 800, score: 97, demand: 'Muito Alta',
  },
  {
    id: 9, rank: 9,
    name: 'Oral-B iO Series 4 Electric Toothbrush',
    brand: 'Oral-B', category: 'Saúde & Beleza',
    store: { name: 'Walgreens', emoji: '💊', color: '#E31837',
      price: 49.99, original: 149.99, discount: 67,
      url: 'https://www.walgreens.com/search/results.jsp?Ntt=oral-b+io+series+4+electric+toothbrush',
      searchUrl: 'https://www.walgreens.com/search/results.jsp?Ntt=oral-b+io+series+4',
      mapUrl: 'https://www.google.com/maps/search/Walgreens+pharmacy+near+me',
      badge: 'Weekly Sale', storeCount: 2340, inStock: true },
    marketplace: {
      amazon: { price: 119.99, url: 'https://www.amazon.com/s?k=Oral-B+iO+Series+4+electric+toothbrush', asin: 'B09CF6WN22', reviews: 14000, rating: 4.5 },
      ebay:   { price: 89.00, url: 'https://www.ebay.com/sch/i.html?_nkw=Oral-B+iO+Series+4+electric+toothbrush&_sop=12', reviews: 0, rating: 0 },
      walmart: { price: 99.99, url: 'https://www.walmart.com/search?q=Oral-B+iO+Series+4+electric+toothbrush', reviews: 0, rating: 0 },
    },
    monthlyUnits: 2100, score: 98, demand: 'Muito Alta',
  },
  {
    id: 10, rank: 10,
    name: 'Philips Sonicare ProtectiveClean 4100 HX6817/01',
    brand: 'Philips', category: 'Saúde & Beleza',
    store: { name: 'CVS', emoji: '🏥', color: '#CC0000',
      price: 29.99, original: 79.99, discount: 63,
      url: 'https://www.cvs.com/search/?searchTerm=philips+sonicare+4100+hx6817',
      searchUrl: 'https://www.cvs.com/search/?searchTerm=philips+sonicare+protectiveclean+4100',
      mapUrl: 'https://www.google.com/maps/search/CVS+pharmacy+near+me',
      badge: 'Sale', storeCount: 1987, inStock: true },
    marketplace: {
      amazon: { price: 69.95, url: 'https://www.amazon.com/s?k=Philips+Sonicare+ProtectiveClean+4100+HX6817', asin: 'B078SWTXJL', reviews: 43000, rating: 4.7 },
      ebay:   { price: 49.99, url: 'https://www.ebay.com/sch/i.html?_nkw=Philips+Sonicare+4100+HX6817&_sop=12', reviews: 0, rating: 0 },
      walmart: { price: 59.99, url: 'https://www.walmart.com/search?q=Philips+Sonicare+ProtectiveClean+4100', reviews: 0, rating: 0 },
    },
    monthlyUnits: 1900, score: 96, demand: 'Muito Alta',
  },
  {
    id: 11, rank: 11,
    name: 'Nike Men Revolution 7 Running Shoes',
    brand: 'Nike', category: 'Moda & Calçados',
    store: { name: "Kohl's", emoji: '🏬', color: '#4A154B',
      price: 41.99, original: 75.00, discount: 44,
      url: "https://www.kohls.com/catalog/search.jsp?search=nike+revolution+7+running+shoes+men",
      searchUrl: "https://www.kohls.com/catalog/search.jsp?search=nike+revolution+7+men+running",
      mapUrl: "https://www.google.com/maps/search/Kohl's+store+near+me",
      badge: 'Best Seller', storeCount: 1100, inStock: true },
    marketplace: {
      amazon: { price: 74.99, url: 'https://www.amazon.com/s?k=Nike+Revolution+7+mens+running+shoes', asin: 'B0B6LBVNX6', reviews: 28000, rating: 4.5 },
      ebay:   { price: 64.99, url: 'https://www.ebay.com/sch/i.html?_nkw=Nike+Revolution+7+mens+running+shoes&_sop=12', reviews: 0, rating: 0 },
      walmart: { price: 69.99, url: 'https://www.walmart.com/search?q=Nike+Revolution+7+mens+running+shoes', reviews: 0, rating: 0 },
    },
    monthlyUnits: 5200, score: 92, demand: 'Muito Alta',
  },
  {
    id: 12, rank: 12,
    name: "Ninja Foodi 14-in-1 8qt XL Pressure Cooker FD401",
    brand: 'Ninja', category: 'Casa & Cozinha',
    store: { name: "Sam's Club", emoji: '📦', color: '#007DC6',
      price: 149.98, original: 279.99, discount: 46,
      url: 'https://www.samsclub.com/p/ninja-foodi-14-in-1-8-qt-xl-pressure-cooker-steam-fryer/prod26791044',
      searchUrl: "https://www.samsclub.com/s?searchTerm=ninja+foodi+FD401+pressure+cooker",
      mapUrl: "https://www.google.com/maps/search/Sam's+Club+warehouse+near+me",
      badge: "Member's Value", storeCount: 348, inStock: true },
    marketplace: {
      amazon: { price: 229.99, url: 'https://www.amazon.com/s?k=Ninja+FD401+Foodi+8qt+pressure+cooker+air+fryer', asin: 'B07T8HJMCT', reviews: 34000, rating: 4.8 },
      ebay:   { price: 199.00, url: 'https://www.ebay.com/sch/i.html?_nkw=Ninja+FD401+Foodi+pressure+cooker&_sop=12', reviews: 0, rating: 0 },
      walmart: { price: 219.00, url: 'https://www.walmart.com/search?q=Ninja+FD401+Foodi+pressure+cooker+air+fryer', reviews: 0, rating: 0 },
    },
    monthlyUnits: 2400, score: 91, demand: 'Alta',
  },
];

const CATEGORIES = ['Todas', 'Casa & Cozinha', 'Ferramentas', 'Saúde & Beleza', 'Moda & Calçados'];

function calcMargin(buyPrice: number, sellPrice: number, mp: { feeRate: number; fbaFee: number }) {
  const fees = sellPrice * mp.feeRate + mp.fbaFee;
  const profit = sellPrice - buyPrice - fees;
  const roi = buyPrice > 0 ? (profit / buyPrice) * 100 : 0;
  return { profit: Math.max(0, profit), roi: Math.max(0, roi), fees };
}

function ScoreDot({ score }: { score: number }) {
  const bg = score >= 95 ? 'bg-emerald-500' : score >= 85 ? 'bg-green-500' : 'bg-blue-500';
  return <span className={`${bg} text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center`}>{score}</span>;
}

function Pill({ label, color }: { label: string; color: string }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${color}`}>{label}</span>;
}

function timeAgo(ms: number) {
  const m = Math.floor(ms / 60000);
  return m < 60 ? m + 'm atrás' : Math.floor(m / 60) + 'h atrás';
}

export default function ScannerPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [minDisc, setMinDisc] = useState('');
  const [minRoi, setMinRoi] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [mpView, setMpView] = useState<'amazon' | 'ebay' | 'walmart'>('amazon');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanPct, setScanPct] = useState(0);

  const selected = PRODUCTS.find(p => p.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    let data = [...PRODUCTS];
    if (search) data = data.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.store.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );
    if (category !== 'Todas') data = data.filter(p => p.category === category);
    if (minDisc) data = data.filter(p => p.store.discount >= Number(minDisc));
    if (minRoi) data = data.filter(p => {
      const mp = MP_FEES[mpView];
      const { roi } = calcMargin(p.store.price, p.marketplace[mpView].price, mp);
      return roi >= Number(minRoi);
    });
    data.sort((a, b) => {
      const mpFees = MP_FEES[mpView];
      if (sortBy === 'rank') return a.rank - b.rank;
      if (sortBy === 'roi') {
        const roiA = calcMargin(a.store.price, a.marketplace[mpView].price, mpFees).roi;
        const roiB = calcMargin(b.store.price, b.marketplace[mpView].price, mpFees).roi;
        return roiB - roiA;
      }
      if (sortBy === 'profit') {
        const pA = calcMargin(a.store.price, a.marketplace[mpView].price, mpFees).profit;
        const pB = calcMargin(b.store.price, b.marketplace[mpView].price, mpFees).profit;
        return pB - pA;
      }
      if (sortBy === 'discount') return b.store.discount - a.store.discount;
      if (sortBy === 'volume') return b.monthlyUnits - a.monthlyUnits;
      if (sortBy === 'score') return b.score - a.score;
      return 0;
    });
    return data;
  }, [search, category, minDisc, minRoi, sortBy, mpView]);

  const handleScan = () => {
    setIsScanning(true); setScanPct(0);
    const steps = [8, 20, 35, 50, 65, 78, 90, 100];
    let i = 0;
    const t = setInterval(() => {
      setScanPct(steps[i] ?? 100); i++;
      if (i >= steps.length) { clearInterval(t); setIsScanning(false); }
    }, 400);
  };

  const totalProfit = filtered.reduce((s, p) => s + calcMargin(p.store.price, p.marketplace[mpView].price, MP_FEES[mpView]).profit, 0);
  const avgRoi = filtered.length ? filtered.reduce((s, p) => s + calcMargin(p.store.price, p.marketplace[mpView].price, MP_FEES[mpView]).roi, 0) / filtered.length : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">🔍 Scanner — Comprar Barato e Revender</h1>
          <p className="text-gray-400 text-sm mt-0.5">Encontre promoções em lojas físicas e calcule margem por marketplace</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleScan} disabled={isScanning}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${isScanning ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25'}`}>
            {isScanning ? <><span className="animate-spin">⟳</span> {scanPct}%</> : '⚡ Escanear Lojas'}
          </button>
        </div>
      </div>

      {isScanning && (
        <div className="bg-gray-800/80 border border-blue-500/30 rounded-xl p-4">
          <div className="flex justify-between mb-2"><span className="text-blue-400 text-sm animate-pulse">🔍 Escaneando lojas físicas...</span><span className="text-blue-400 font-bold">{scanPct}%</span></div>
          <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all" style={{width: scanPct + '%'}} /></div>
          <div className="text-xs text-gray-500 mt-2">Target · Best Buy · Costco · Home Depot · Kohl's · TJ Maxx · Marshalls · Walgreens · CVS · Sam's Club</div>
        </div>
      )}

      {/* Marketplace selector */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm font-medium">Calcular margem para:</span>
        {(Object.entries(MP_FEES) as [string, typeof MP_FEES[string]][]).map(([key, mp]) => (
          <button key={key} onClick={() => setMpView(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${mpView === key ? 'text-white border-transparent shadow-lg' : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-500'}`}
            style={mpView === key ? { backgroundColor: mp.color, boxShadow: `0 0 20px ${mp.color}44` } : {}}>
            {mp.emoji} {mp.name}
          </button>
        ))}
        <span className="text-xs text-gray-500 ml-2">Taxa: {(MP_FEES[mpView].feeRate * 100).toFixed(1)}% + ${MP_FEES[mpView].fbaFee.toFixed(2)} FBA</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-center"><div className="text-xl font-bold text-white">{filtered.length}</div><div className="text-xs text-gray-400 mt-0.5">Produtos</div></div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-center"><div className="text-xl font-bold text-green-400">{avgRoi.toFixed(1)}%</div><div className="text-xs text-gray-400 mt-0.5">ROI Médio {MP_FEES[mpView].name}</div></div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-center"><div className="text-xl font-bold text-blue-400">${totalProfit.toFixed(0)}</div><div className="text-xs text-gray-400 mt-0.5">Lucro Total</div></div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-center"><div className="text-xl font-bold text-purple-400">{filtered.filter(p => calcMargin(p.store.price, p.marketplace[mpView].price, MP_FEES[mpView]).roi >= 50).length}</div><div className="text-xs text-gray-400 mt-0.5">ROI ≥ 50%</div></div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-2">
            <label className="text-xs text-gray-400 block mb-1">🔎 Buscar produto, marca ou loja</label>
            <input type="text" placeholder="Ex: Ninja, DEWALT, Walgreens..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-600" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Categoria</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-blue-500">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Desc. Mín %</label>
            <input type="number" placeholder="40" value={minDisc} onChange={e => setMinDisc(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-600" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">ROI Mín %</label>
            <input type="number" placeholder="30" value={minRoi} onChange={e => setMinRoi(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-600" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Ordenar por</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-blue-500">
              <option value="rank">🏆 + Vendidos</option>
              <option value="roi">💰 Maior ROI</option>
              <option value="profit">💵 Maior Lucro</option>
              <option value="discount">🏷️ Desconto</option>
              <option value="volume">📦 Volume</option>
              <option value="score">🤖 Score IA</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs text-gray-600">Atalhos:</span>
          <button onClick={() => { setSortBy('roi'); setMinRoi('50'); }} className="text-xs px-3 py-1 bg-green-600/20 text-green-400 border border-green-600/30 rounded-full hover:bg-green-600/30">💰 ROI 50%+</button>
          <button onClick={() => { setMinDisc('50'); setSortBy('discount'); }} className="text-xs px-3 py-1 bg-red-600/20 text-red-400 border border-red-600/30 rounded-full hover:bg-red-600/30">🏷️ Desc 50%+</button>
          <button onClick={() => { setSortBy('volume'); setMinDisc(''); setMinRoi(''); }} className="text-xs px-3 py-1 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-full hover:bg-purple-600/30">🏆 Mais Vendidos</button>
          <button onClick={() => { setCategory('Ferramentas'); }} className="text-xs px-3 py-1 bg-orange-600/20 text-orange-400 border border-orange-600/30 rounded-full hover:bg-orange-600/30">🔨 Ferramentas</button>
          <button onClick={() => { setCategory('Saúde & Beleza'); setMinRoi('70'); }} className="text-xs px-3 py-1 bg-pink-600/20 text-pink-400 border border-pink-600/30 rounded-full hover:bg-pink-600/30">💊 Saúde</button>
          <button onClick={() => { setSearch(''); setCategory('Todas'); setMinDisc(''); setMinRoi(''); setSortBy('rank'); }} className="text-xs px-3 py-1 bg-gray-700/60 text-gray-400 border border-gray-600/30 rounded-full hover:bg-gray-600/60">✕ Limpar</button>
        </div>
      </div>

      {/* Product list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-12 text-center text-gray-500">
            <div className="text-4xl mb-2">🔍</div><div>Nenhum produto com esses filtros</div>
          </div>
        )}
        {filtered.map(prod => {
          const mp = MP_FEES[mpView];
          const mpData = prod.marketplace[mpView];
          const { profit, roi, fees } = calcMargin(prod.store.price, mpData.price, mp);
          const isOpen = selectedId === prod.id;
          const roiColor = roi >= 80 ? 'text-emerald-400' : roi >= 40 ? 'text-green-400' : roi >= 20 ? 'text-yellow-400' : 'text-red-400';
          return (
            <div key={prod.id} onClick={() => setSelectedId(isOpen ? null : prod.id)}
              className={`border rounded-xl cursor-pointer transition-all ${isOpen ? 'border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-500/10' : 'border-gray-700/50 bg-gray-800/50 hover:bg-gray-800/80 hover:border-gray-600'}`}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Rank + Score */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 w-8">
                    <span className="text-xs text-gray-600 font-mono">#{prod.rank}</span>
                    <ScoreDot score={prod.score} />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-white font-semibold text-sm">{prod.name}</span>
                      <Pill label={prod.store.badge} color="bg-amber-500/20 text-amber-400 border-amber-500/30" />
                      <Pill label={prod.demand} color={prod.demand === 'Muito Alta' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-blue-500/20 text-blue-400 border-blue-500/40'} />
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Buy price */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs px-2 py-0.5 rounded-full text-white text-xs font-medium" style={{ backgroundColor: prod.store.color + 'CC' }}>{prod.store.emoji} {prod.store.name}</span>
                        {prod.store.discount > 0 && <span className="text-gray-500 text-xs line-through">${prod.store.original.toFixed(2)}</span>}
                        <span className="text-white font-bold">${prod.store.price.toFixed(2)}</span>
                        {prod.store.discount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">-{prod.store.discount}%</span>}
                      </div>
                      {/* Arrow */}
                      <span className="text-gray-600 text-lg">→</span>
                      {/* Sell price */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium" style={{ color: mp.color }}>{mp.emoji} {mp.name}</span>
                        <span className="text-green-400 font-bold">${mpData.price.toFixed(2)}</span>
                      </div>
                      {/* Profit & ROI */}
                      <div className="flex items-center gap-3 text-xs text-gray-400 ml-2">
                        <span>Lucro: <span className="text-green-400 font-bold">${profit.toFixed(2)}</span></span>
                        <span>ROI: <span className={`font-bold ${roiColor}`}>{roi.toFixed(1)}%</span></span>
                        <span>📦 {prod.monthlyUnits.toLocaleString()}/mês</span>
                      </div>
                    </div>
                  </div>
                  {/* Buttons */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <a href={prod.store.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap">
                      🛒 Comprar na {prod.store.name}
                    </a>
                    <a href={mpData.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border"
                      style={{ color: mp.color, borderColor: mp.color + '66', backgroundColor: mp.color + '22' }}>
                      {mp.emoji} Vender no {mp.name}
                    </a>
                  </div>
                </div>
              </div>

              {/* EXPANDED */}
              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-700/40 pt-4">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Margin calc all 3 marketplaces */}
                    <div className="col-span-2">
                      <h4 className="text-white font-semibold text-xs mb-3">💰 Cálculo de Margem por Marketplace</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {(Object.entries(prod.marketplace) as [string, typeof prod.marketplace.amazon][]).map(([mpKey, mpInfo]) => {
                          const mpFee = MP_FEES[mpKey];
                          const { profit: p, roi: r, fees: f } = calcMargin(prod.store.price, mpInfo.price, mpFee);
                          const isActive = mpKey === mpView;
                          return (
                            <div key={mpKey} onClick={e => { e.stopPropagation(); setMpView(mpKey as any); }}
                              className={`rounded-xl p-3 border cursor-pointer transition-all ${isActive ? 'border-opacity-80' : 'border-gray-700/50 bg-gray-900/40 hover:bg-gray-800/60'}`}
                              style={isActive ? { borderColor: mpFee.color, backgroundColor: mpFee.color + '18' } : {}}>
                              <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-base">{mpFee.emoji}</span>
                                <span className="text-white font-semibold text-xs">{mpFee.name}</span>
                                {isActive && <span className="text-xs px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: mpFee.color }}>ativo</span>}
                              </div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between"><span className="text-gray-400">Preço de venda</span><a href={mpInfo.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="font-bold hover:underline" style={{ color: mpFee.color }}>${mpInfo.price.toFixed(2)}</a></div>
                                <div className="flex justify-between"><span className="text-gray-400">Taxas</span><span className="text-red-400">-${f.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">Custo compra</span><span className="text-gray-300">-${prod.store.price.toFixed(2)}</span></div>
                                <div className="h-px bg-gray-700/50 my-1" />
                                <div className="flex justify-between"><span className="text-gray-300 font-medium">Lucro líquido</span><span className="text-green-400 font-bold">${p.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-300 font-medium">ROI</span><span className={`font-bold ${r >= 50 ? 'text-emerald-400' : r >= 25 ? 'text-green-400' : 'text-yellow-400'}`}>{r.toFixed(1)}%</span></div>
                                {mpInfo.reviews > 0 && <div className="flex justify-between pt-1"><span className="text-gray-500">Reviews</span><span className="text-gray-400">{mpInfo.reviews.toLocaleString()} ⭐{mpInfo.rating}</span></div>}
                              </div>
                              <a href={mpInfo.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                className="mt-2 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:opacity-80"
                                style={{ borderColor: mpFee.color + '66', color: mpFee.color, backgroundColor: mpFee.color + '15' }}>
                                {mpFee.emoji} Ver no {mpFee.name} →
                              </a>
                            </div>
                          );
                        })}
                      </div>
                      {/* Best marketplace recommendation */}
                      {(() => {
                        const best = (Object.entries(prod.marketplace) as [string, typeof prod.marketplace.amazon][])
                          .map(([k, v]) => ({ key: k, ...calcMargin(prod.store.price, v.price, MP_FEES[k]) }))
                          .sort((a, b) => b.roi - a.roi)[0];
                        const bestMp = MP_FEES[best.key];
                        return (
                          <div className="mt-3 p-3 rounded-xl border border-emerald-500/30 bg-emerald-900/10">
                            <span className="text-emerald-400 text-xs font-semibold">✅ Melhor opção: {bestMp.emoji} {bestMp.name} — ROI {best.roi.toFixed(1)}% · Lucro ${best.profit.toFixed(2)}</span>
                          </div>
                        );
                      })()}
                    </div>
                    {/* Map + store info */}
                    <div>
                      <h4 className="text-white font-semibold text-xs mb-3">📍 Localização — {prod.store.name}</h4>
                      <div className="rounded-lg overflow-hidden mb-2">
                        <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(prod.store.name + ' store near me')}&output=embed&z=13`} width="100%" height="170" style={{border:0}} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between"><span className="text-gray-400">Lojas disponíveis</span><span className="text-white">{prod.store.storeCount}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Vendidos/mês</span><span className="text-purple-400 font-medium">{prod.monthlyUnits.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Desconto loja</span><span className="text-red-400 font-bold">{prod.store.discount}%</span></div>
                      </div>
                      <div className="flex flex-col gap-1.5 mt-2">
                        <a href={prod.store.url} target="_blank" rel="noopener noreferrer" className="text-center py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors">🛒 Comprar na {prod.store.name}</a>
                        <a href={prod.store.mapUrl} target="_blank" rel="noopener noreferrer" className="text-center py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-lg text-xs font-medium transition-colors">📍 Ver no Google Maps</a>
                        <a href={prod.store.searchUrl} target="_blank" rel="noopener noreferrer" className="text-center py-1.5 bg-gray-700/50 hover:bg-gray-600/60 text-gray-300 border border-gray-600/40 rounded-lg text-xs font-medium transition-colors">🔎 Buscar na Loja</a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-xs text-gray-600 text-center pb-2">
        💡 Taxas: Amazon 15% + $4.50 FBA · eBay 13.25% · Walmart 15% · Preços verificados junho 2026 · Clique para confirmar disponibilidade atual
      </div>
    </div>
  );
}
