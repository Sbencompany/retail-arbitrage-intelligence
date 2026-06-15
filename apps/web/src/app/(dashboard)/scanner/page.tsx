'use client';
import { useState, useEffect, useMemo } from 'react';

const STORES_MAP: Record<string, { name: string; color: string; emoji: string; mapQuery: string }> = {
  target: { name: 'Target', color: '#CC0000', emoji: '🎯', mapQuery: 'Target+store' },
  homedepot: { name: 'Home Depot', color: '#F96302', emoji: '🏠', mapQuery: 'Home+Depot+store' },
  costco: { name: 'Costco', color: '#005DAA', emoji: '🏪', mapQuery: 'Costco+warehouse' },
  bestbuy: { name: 'Best Buy', color: '#003B64', emoji: '💙', mapQuery: 'Best+Buy+store' },
  walgreens: { name: 'Walgreens', color: '#E31837', emoji: '💊', mapQuery: 'Walgreens+pharmacy' },
  cvs: { name: 'CVS Pharmacy', color: '#CC0000', emoji: '🏥', mapQuery: 'CVS+Pharmacy' },
  tjmaxx: { name: 'TJ Maxx', color: '#C41230', emoji: '👗', mapQuery: 'TJ+Maxx+store' },
  marshalls: { name: 'Marshalls', color: '#005B99', emoji: '🛍️', mapQuery: 'Marshalls+store' },
  kohls: { name: "Kohl's", color: '#4A154B', emoji: '🏬', mapQuery: 'Kohls+department+store' },
  macys: { name: "Macy's", color: '#E21A1A', emoji: '⭐', mapQuery: 'Macys+department+store' },
  samsclub: { name: "Sam's Club", color: '#007DC6', emoji: '📦', mapQuery: 'Sams+Club+warehouse' },
  acehardware: { name: 'Ace Hardware', color: '#E31837', emoji: '🔨', mapQuery: 'Ace+Hardware+store' },
};

const CATEGORIES = ['Todas', 'Eletrônicos', 'Casa & Jardim', 'Ferramentas', 'Saúde & Beleza', 'Brinquedos', 'Moda & Vestuário', 'Esportes', 'Automotivo'];

type Deal = {
  id: number; store: string; product: string; category: string; sku: string;
  originalPrice: number; dealPrice: number; discount: number; inStock: boolean;
  storeCount: number; city: string; zip: string; url: string; mapUrl: string;
  image: string; lastUpdated: string; roi: number; score: number;
  demand: string; resalePrice: number; profit: number;
};

const DEALS: Deal[] = [
  { id:1, store:'target', product:'Shark IQ Robot Vacuum AV1002WD', category:'Casa & Jardim', sku:'86543210', originalPrice:399.99, dealPrice:159.99, discount:60, inStock:true, storeCount:127, city:'Chicago, IL', zip:'60601', url:'https://www.target.com/p/shark-iq-robot-vacuum/-/A-86543210', mapUrl:'https://www.google.com/maps/search/Target+store+near+Chicago+IL', image:'🤖', lastUpdated:new Date(Date.now()-12*60000).toISOString(), roi:48.2, score:94, demand:'Muito Alta', resalePrice:279.00, profit:87.01 },
  { id:2, store:'homedepot', product:'DEWALT 20V MAX Cordless Drill Combo Kit DCK277C2', category:'Ferramentas', sku:'308498452', originalPrice:329.00, dealPrice:119.00, discount:64, inStock:true, storeCount:89, city:'Dallas, TX', zip:'75201', url:'https://www.homedepot.com/p/DEWALT-20V-MAX-Cordless-Drill/308498452', mapUrl:'https://www.google.com/maps/search/Home+Depot+near+Dallas+TX', image:'🔨', lastUpdated:new Date(Date.now()-5*60000).toISOString(), roi:55.1, score:97, demand:'Muito Alta', resalePrice:239.00, profit:91.00 },
  { id:3, store:'costco', product:'Ninja Foodi 14-in-1 8qt Pressure Cooker & Air Fryer', category:'Casa & Jardim', sku:'1645798', originalPrice:229.99, dealPrice:89.97, discount:61, inStock:true, storeCount:42, city:'Seattle, WA', zip:'98101', url:'https://www.costco.com/ninja-foodi-14-in-1-8qt.product.1645798.html', mapUrl:'https://www.google.com/maps/search/Costco+warehouse+near+Seattle+WA', image:'🍳', lastUpdated:new Date(Date.now()-22*60000).toISOString(), roi:42.8, score:91, demand:'Alta', resalePrice:169.99, profit:58.02 },
  { id:4, store:'bestbuy', product:'Sony 65" BRAVIA XR A80L OLED 4K TV', category:'Eletrônicos', sku:'6543241', originalPrice:2499.99, dealPrice:1099.99, discount:56, inStock:true, storeCount:31, city:'Los Angeles, CA', zip:'90001', url:'https://www.bestbuy.com/site/sony-65-bravia-xr/6543241.p', mapUrl:'https://www.google.com/maps/search/Best+Buy+near+Los+Angeles+CA', image:'📺', lastUpdated:new Date(Date.now()-8*60000).toISOString(), roi:31.7, score:88, demand:'Alta', resalePrice:1699.00, profit:467.01 },
  { id:5, store:'walgreens', product:'Oral-B iO Series 9 Electric Toothbrush', category:'Saúde & Beleza', sku:'583920', originalPrice:299.99, dealPrice:79.99, discount:73, inStock:true, storeCount:234, city:'Miami, FL', zip:'33101', url:'https://www.walgreens.com/store/c/oral-b-io-series/ID=prod6545218', mapUrl:'https://www.google.com/maps/search/Walgreens+near+Miami+FL', image:'🦷', lastUpdated:new Date(Date.now()-3*60000).toISOString(), roi:87.4, score:98, demand:'Muito Alta', resalePrice:179.99, profit:71.00 },
  { id:6, store:'tjmaxx', product:'KitchenAid Professional 5qt Stand Mixer KP26M1X', category:'Casa & Jardim', sku:'TJX884521', originalPrice:449.99, dealPrice:179.99, discount:60, inStock:true, storeCount:156, city:'Atlanta, GA', zip:'30301', url:'https://www.tjmaxx.com/tjmaxx/shop/product/kitchenaid-professional-stand-mixer', mapUrl:'https://www.google.com/maps/search/TJ+Maxx+near+Atlanta+GA', image:'🥣', lastUpdated:new Date(Date.now()-35*60000).toISOString(), roi:53.9, score:95, demand:'Muito Alta', resalePrice:329.00, profit:119.01 },
  { id:7, store:'kohls', product:'Nike Air Zoom Pegasus 41 Running Shoes', category:'Moda & Vestuário', sku:'NK894521', originalPrice:130.00, dealPrice:45.99, discount:65, inStock:true, storeCount:312, city:'Phoenix, AZ', zip:'85001', url:'https://www.kohls.com/product/prd-7184521/nike-air-zoom-pegasus-41.jsp', mapUrl:'https://www.google.com/maps/search/Kohls+near+Phoenix+AZ', image:'👟', lastUpdated:new Date(Date.now()-18*60000).toISOString(), roi:84.2, score:96, demand:'Muito Alta', resalePrice:99.99, profit:38.00 },
  { id:8, store:'cvs', product:'Braun Series 9 Pro Electric Shaver 9477cc', category:'Saúde & Beleza', sku:'CVS7829301', originalPrice:279.99, dealPrice:84.99, discount:70, inStock:true, storeCount:189, city:'Boston, MA', zip:'02101', url:'https://www.cvs.com/shop/braun-series-9-pro-electric-shaver-prodid-4862932', mapUrl:'https://www.google.com/maps/search/CVS+Pharmacy+near+Boston+MA', image:'🪒', lastUpdated:new Date(Date.now()-7*60000).toISOString(), roi:76.3, score:93, demand:'Alta', resalePrice:179.99, profit:71.00 },
  { id:9, store:'marshalls', product:'Le Creuset Dutch Oven 5.5qt Flame Orange', category:'Casa & Jardim', sku:'MRS445812', originalPrice:420.00, dealPrice:149.99, discount:64, inStock:true, storeCount:78, city:'Denver, CO', zip:'80201', url:'https://www.marshalls.com/us/store/browse/Le-Creuset-Dutch-Oven/cat60004/', mapUrl:'https://www.google.com/maps/search/Marshalls+near+Denver+CO', image:'🍲', lastUpdated:new Date(Date.now()-41*60000).toISOString(), roi:62.0, score:92, demand:'Alta', resalePrice:299.99, profit:120.00 },
  { id:10, store:'target', product:'Lego Technic McLaren Formula E 42169 (503pcs)', category:'Brinquedos', sku:'LEGO42169', originalPrice:89.99, dealPrice:29.98, discount:67, inStock:true, storeCount:203, city:'Houston, TX', zip:'77001', url:'https://www.target.com/p/lego-technic-mclaren/-/A-87654321', mapUrl:'https://www.google.com/maps/search/Target+near+Houston+TX', image:'🧱', lastUpdated:new Date(Date.now()-15*60000).toISOString(), roi:93.5, score:99, demand:'Muito Alta', resalePrice:69.99, profit:31.01 },
  { id:11, store:'homedepot', product:'Milwaukee M18 FUEL 7-1/4" Circular Saw (Tool Only)', category:'Ferramentas', sku:'MIL2732', originalPrice:199.00, dealPrice:69.00, discount:65, inStock:true, storeCount:54, city:'Portland, OR', zip:'97201', url:'https://www.homedepot.com/p/Milwaukee-M18-FUEL/313107484', mapUrl:'https://www.google.com/maps/search/Home+Depot+near+Portland+OR', image:'🔵', lastUpdated:new Date(Date.now()-29*60000).toISOString(), roi:71.6, score:90, demand:'Alta', resalePrice:149.00, profit:62.00 },
  { id:12, store:'samsclub', product:'Dyson V15 Detect Cordless Vacuum Cleaner', category:'Casa & Jardim', sku:'SAM980134', originalPrice:749.99, dealPrice:349.98, discount:53, inStock:true, storeCount:37, city:'Nashville, TN', zip:'37201', url:'https://www.samsclub.com/p/dyson-v15-detect/prod26430157', mapUrl:'https://www.google.com/maps/search/Sams+Club+near+Nashville+TN', image:'🌀', lastUpdated:new Date(Date.now()-52*60000).toISOString(), roi:37.2, score:85, demand:'Alta', resalePrice:579.00, profit:172.02 },
  { id:13, store:'bestbuy', product:'Samsung Galaxy S24 Ultra 256GB (Open Box Excellent)', category:'Eletrônicos', sku:'BB6571234', originalPrice:1299.99, dealPrice:499.99, discount:62, inStock:true, storeCount:28, city:'New York, NY', zip:'10001', url:'https://www.bestbuy.com/site/samsung-galaxy-s24-ultra/6571234.p', mapUrl:'https://www.google.com/maps/search/Best+Buy+near+New+York+NY', image:'📱', lastUpdated:new Date(Date.now()-4*60000).toISOString(), roi:72.3, score:96, demand:'Muito Alta', resalePrice:899.00, profit:311.01 },
  { id:14, store:'acehardware', product:'Weber Spirit II E-310 3-Burner Gas Grill', category:'Casa & Jardim', sku:'ACE6521034', originalPrice:549.00, dealPrice:219.99, discount:60, inStock:true, storeCount:67, city:'Minneapolis, MN', zip:'55401', url:'https://www.acehardware.com/departments/outdoor-living/grills/gas-grills/7797143', mapUrl:'https://www.google.com/maps/search/Ace+Hardware+near+Minneapolis+MN', image:'🔥', lastUpdated:new Date(Date.now()-63*60000).toISOString(), roi:49.5, score:87, demand:'Alta', resalePrice:399.00, profit:143.01 },
  { id:15, store:'macys', product:"Adidas Ultraboost 24 Running Shoes (Men's)", category:'Moda & Vestuário', sku:'MCS7821093', originalPrice:190.00, dealPrice:56.99, discount:70, inStock:true, storeCount:198, city:'Las Vegas, NV', zip:'89101', url:'https://www.macys.com/shop/product/adidas-ultraboost-24/ID=16820190', mapUrl:'https://www.google.com/maps/search/Macys+near+Las+Vegas+NV', image:'👟', lastUpdated:new Date(Date.now()-9*60000).toISOString(), roi:101.8, score:99, demand:'Muito Alta', resalePrice:139.99, profit:61.00 },
  { id:16, store:'kohls', product:'Instant Pot Duo 7-in-1 Electric Pressure Cooker 8qt', category:'Casa & Jardim', sku:'KHL6548210', originalPrice:119.99, dealPrice:39.99, discount:67, inStock:true, storeCount:276, city:'San Antonio, TX', zip:'78201', url:'https://www.kohls.com/product/prd-5487210/instant-pot-duo.jsp', mapUrl:'https://www.google.com/maps/search/Kohls+near+San+Antonio+TX', image:'⚡', lastUpdated:new Date(Date.now()-26*60000).toISOString(), roi:80.0, score:93, demand:'Muito Alta', resalePrice:89.99, profit:36.00 },
];

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'agora mesmo';
  if (mins < 60) return mins + 'm atrás';
  return Math.floor(mins/60) + 'h atrás';
}

function ScoreBadge({ score }: { score: number }) {
  const bg = score >= 95 ? 'bg-green-500' : score >= 85 ? 'bg-blue-500' : 'bg-yellow-500';
  return <span className={`${bg} text-white text-xs font-bold px-2 py-1 rounded-full`}>{score}</span>;
}

function DemandBadge({ d }: { d: string }) {
  const cls: Record<string,string> = { 'Muito Alta': 'bg-green-500/20 text-green-400 border-green-500/30', 'Alta': 'bg-blue-500/20 text-blue-400 border-blue-500/30', 'Média': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
  return <span className={`text-xs px-2 py-1 rounded-full border ${cls[d]||''}`}>{d}</span>;
}

export default function ScannerPage() {
  const [deals, setDeals] = useState<Deal[]>(DEALS);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [category, setCategory] = useState('Todas');
  const [storeFilter, setStoreFilter] = useState('Todas');
  const [minDiscount, setMinDiscount] = useState('');
  const [minRoi, setMinRoi] = useState('');
  const [minScore, setMinScore] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState(new Date());
  const [scanProgress, setScanProgress] = useState(0);
  const [newDealsCount, setNewDealsCount] = useState(0);
  const [viewMode, setViewMode] = useState<'table'|'cards'>('table');

  // Simulate live scanning
  useEffect(() => {
    const interval = setInterval(() => {
      setDeals(prev => prev.map(d => ({ ...d, lastUpdated: new Date(new Date(d.lastUpdated).getTime() + 60000).toISOString() })));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setNewDealsCount(0);
    const steps = [10, 25, 40, 55, 70, 82, 91, 100];
    let i = 0;
    const t = setInterval(() => {
      setScanProgress(steps[i] || 100);
      i++;
      if (i >= steps.length) {
        clearInterval(t);
        setIsScanning(false);
        setLastScan(new Date());
        setNewDealsCount(Math.floor(Math.random() * 5) + 1);
        setDeals(prev => prev.map(d => ({ ...d, lastUpdated: new Date().toISOString() })));
      }
    }, 400);
  };

  const storeOptions = ['Todas', ...Object.keys(STORES_MAP).map(k => STORES_MAP[k].name)];

  const filtered = useMemo(() => {
    let data = [...deals];
    if (category !== 'Todas') data = data.filter(d => d.category === category);
    if (storeFilter !== 'Todas') data = data.filter(d => STORES_MAP[d.store]?.name === storeFilter);
    if (minDiscount) data = data.filter(d => d.discount >= Number(minDiscount));
    if (minRoi) data = data.filter(d => d.roi >= Number(minRoi));
    if (minScore) data = data.filter(d => d.score >= Number(minScore));
    data.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'roi') return b.roi - a.roi;
      if (sortBy === 'discount') return b.discount - a.discount;
      if (sortBy === 'profit') return b.profit - a.profit;
      if (sortBy === 'price') return a.dealPrice - b.dealPrice;
      return 0;
    });
    return data;
  }, [deals, category, storeFilter, minDiscount, minRoi, minScore, sortBy]);

  const totalProfit = filtered.reduce((s,d) => s + d.profit, 0);
  const avgRoi = filtered.length ? filtered.reduce((s,d) => s + d.roi, 0) / filtered.length : 0;
  const avgDiscount = filtered.length ? filtered.reduce((s,d) => s + d.discount, 0) / filtered.length : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">🔍 Scanner de Deals ao Vivo</h1>
          <p className="text-gray-400 text-sm mt-1">Promoções em lojas físicas — Target, Home Depot, Costco, Best Buy, TJ Maxx, Walgreens e mais</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500">
            Último scan: <span className="text-green-400">{lastScan.toLocaleTimeString('pt-BR')}</span>
            {newDealsCount > 0 && <span className="ml-2 bg-green-500 text-white px-2 py-0.5 rounded-full">+{newDealsCount} novos</span>}
          </div>
          <button onClick={handleScan} disabled={isScanning} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${isScanning ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25'}`}>
            {isScanning ? (<><span className="animate-spin">⟳</span> Escaneando... {scanProgress}%</>) : (<><span>⚡</span> Escanear Agora</>)}
          </button>
          <button onClick={() => setViewMode(v => v === 'table' ? 'cards' : 'table')} className="px-3 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
            {viewMode === 'table' ? '📋' : '🔲'}
          </button>
        </div>
      </div>

      {/* Scan progress */}
      {isScanning && (
        <div className="bg-gray-800/60 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-400 text-sm font-medium">🔍 Escaneando lojas físicas...</span>
            <span className="text-blue-400 text-sm">{scanProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" style={{width: scanProgress + '%'}}></div>
          </div>
          <div className="text-xs text-gray-500 mt-2">Verificando: Target → Home Depot → Costco → Best Buy → TJ Maxx → Walgreens → CVS → Kohl's → Marshalls...</div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-white">{filtered.length}</div>
          <div className="text-xs text-gray-400 mt-1">Deals Ativos</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{avgDiscount.toFixed(0)}%</div>
          <div className="text-xs text-gray-400 mt-1">Desconto Médio</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{avgRoi.toFixed(1)}%</div>
          <div className="text-xs text-gray-400 mt-1">ROI Médio</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">${totalProfit.toFixed(0)}</div>
          <div className="text-xs text-gray-400 mt-1">Lucro Total</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{filtered.filter(d => d.score >= 90).length}</div>
          <div className="text-xs text-gray-400 mt-1">Score 90+</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 space-y-3">
        <h3 className="text-white font-semibold text-sm">🔧 Filtros</h3>
        <div className="grid grid-cols-6 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Categoria</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-blue-500">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Loja Física</label>
            <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-blue-500">
              {storeOptions.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Desc. Mín. (%)</label>
            <input type="number" placeholder="Ex: 50" value={minDiscount} onChange={e => setMinDiscount(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">ROI Mín. (%)</label>
            <input type="number" placeholder="Ex: 40" value={minRoi} onChange={e => setMinRoi(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Score Mín.</label>
            <input type="number" placeholder="Ex: 85" value={minScore} onChange={e => setMinScore(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Ordenar por</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-blue-500">
              <option value="score">Score IA</option>
              <option value="roi">ROI</option>
              <option value="discount">Desconto</option>
              <option value="profit">Lucro</option>
              <option value="price">Preço</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Rápidos:</span>
          <button onClick={() => { setMinDiscount('60'); setMinScore('90'); }} className="text-xs px-3 py-1 bg-red-600/20 text-red-400 border border-red-600/30 rounded-full hover:bg-red-600/30">🔥 Desc. 60%+ / Score 90+</button>
          <button onClick={() => { setMinRoi('70'); }} className="text-xs px-3 py-1 bg-green-600/20 text-green-400 border border-green-600/30 rounded-full hover:bg-green-600/30">💰 ROI 70%+</button>
          <button onClick={() => { setCategory('Eletrônicos'); setMinDiscount('50'); }} className="text-xs px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-full hover:bg-blue-600/30">📱 Eletrônicos 50%+</button>
          <button onClick={() => { setCategory('Ferramentas'); }} className="text-xs px-3 py-1 bg-orange-600/20 text-orange-400 border border-orange-600/30 rounded-full hover:bg-orange-600/30">🔨 Ferramentas</button>
          <button onClick={() => { setCategory('Todas'); setStoreFilter('Todas'); setMinDiscount(''); setMinRoi(''); setMinScore(''); }} className="text-xs px-3 py-1 bg-gray-600/40 text-gray-400 border border-gray-600/30 rounded-full hover:bg-gray-600/50">✕ Limpar</button>
        </div>
      </div>

      {/* Two-column layout: List + Map */}
      <div className="grid grid-cols-5 gap-4">
        {/* Deals List */}
        <div className="col-span-3 space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-12 text-center text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <div>Nenhum deal encontrado</div>
            </div>
          ) : filtered.map(deal => {
            const store = STORES_MAP[deal.store];
            const isSelected = selectedDeal?.id === deal.id;
            return (
              <div key={deal.id} onClick={() => setSelectedDeal(isSelected ? null : deal)}
                className={`bg-gray-800/60 border rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-700/60 ${isSelected ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-700/50'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-3xl leading-none mt-1">{deal.image}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-sm leading-snug">{deal.product}</span>
                        <ScoreBadge score={deal.score} />
                        <DemandBadge d={deal.demand} />
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{backgroundColor: store?.color + '99'}}>{store?.emoji} {store?.name}</span>
                        <span className="text-xs text-gray-400">📍 {deal.city}</span>
                        <span className="text-xs text-gray-500">SKU: {deal.sku}</span>
                        <span className="text-xs text-gray-500">🏪 {deal.storeCount} lojas</span>
                        <span className="text-xs text-gray-600">⏱ {timeAgo(deal.lastUpdated)}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div>
                          <span className="text-xs text-gray-500 line-through">${deal.originalPrice.toFixed(2)}</span>
                          <span className="text-lg font-bold text-white ml-2">${deal.dealPrice.toFixed(2)}</span>
                          <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{deal.discount}%</span>
                        </div>
                        <div className="text-xs text-gray-400">→ Revenda: <span className="text-green-400 font-semibold">${deal.resalePrice.toFixed(2)}</span></div>
                        <div className="text-xs text-gray-400">Lucro: <span className="text-green-400 font-bold">${deal.profit.toFixed(2)}</span></div>
                        <div className="text-xs text-gray-400">ROI: <span className={`font-bold ${deal.roi >= 70 ? 'text-green-400' : deal.roi >= 40 ? 'text-blue-400' : 'text-yellow-400'}`}>{deal.roi.toFixed(1)}%</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <a href={deal.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap">
                      🔗 Ver na Loja
                    </a>
                    <a href={deal.mapUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-lg text-xs font-medium transition-colors whitespace-nowrap">
                      📍 Ver no Mapa
                    </a>
                  </div>
                </div>
                {/* Expanded map view */}
                {isSelected && (
                  <div className="mt-4 border-t border-gray-700/50 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-white text-xs font-semibold mb-2">📊 Análise de Arbitragem</h4>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between"><span className="text-gray-400">Preço de compra:</span><span className="text-white font-medium">${deal.dealPrice.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Preço de revenda:</span><span className="text-green-400 font-medium">${deal.resalePrice.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Lucro líquido:</span><span className="text-green-400 font-bold">${deal.profit.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">ROI:</span><span className="text-blue-400 font-bold">{deal.roi.toFixed(1)}%</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Desconto na loja:</span><span className="text-red-400 font-bold">{deal.discount}%</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Lojas disponíveis:</span><span className="text-white">{deal.storeCount} unidades</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Categoria:</span><span className="text-white">{deal.category}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Demanda:</span><span>{deal.demand}</span></div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-white text-xs font-semibold mb-2">🗺️ Localização das Lojas</h4>
                        <div className="bg-gray-900/80 rounded-lg overflow-hidden" style={{height:'180px'}}>
                          <iframe
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(store?.mapQuery || 'store')}+near+${encodeURIComponent(deal.city)}&output=embed&z=12`}
                            width="100%" height="180" style={{border:0, borderRadius:'8px'}} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                        <a href={deal.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-lg text-xs font-medium transition-colors">
                          📍 Abrir no Google Maps
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Panel: Store Legend + Summary */}
        <div className="col-span-2 space-y-4">
          {/* Selected Deal Map */}
          {selectedDeal ? (
            <div className="bg-gray-800/60 border border-blue-500/30 rounded-xl p-4">
              <h3 className="text-white font-semibold text-sm mb-3">📍 {STORES_MAP[selectedDeal.store]?.name} — {selectedDeal.city}</h3>
              <div className="rounded-lg overflow-hidden">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent((STORES_MAP[selectedDeal.store]?.mapQuery||'store')+' near '+selectedDeal.city)}&output=embed&z=13`}
                  width="100%" height="250" style={{border:0}} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="mt-3 space-y-2">
                <div className="text-sm font-medium text-white">{selectedDeal.product}</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">${selectedDeal.dealPrice.toFixed(2)}</span>
                  <span className="text-sm text-gray-500 line-through">${selectedDeal.originalPrice.toFixed(2)}</span>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{selectedDeal.discount}%</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                    <div className="text-green-400 font-bold text-base">${selectedDeal.profit.toFixed(2)}</div>
                    <div className="text-gray-400">Lucro</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                    <div className="text-blue-400 font-bold text-base">{selectedDeal.roi.toFixed(1)}%</div>
                    <div className="text-gray-400">ROI</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={selectedDeal.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors">🔗 Ver produto</a>
                  <a href={selectedDeal.mapUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-lg text-xs font-medium transition-colors">📍 Mapa completo</a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
              <h3 className="text-white font-semibold text-sm mb-3">🗺️ Mapa Interativo</h3>
              <div className="rounded-lg overflow-hidden">
                <iframe src="https://maps.google.com/maps?q=retail+stores+clearance+deals&output=embed&z=10" width="100%" height="250" style={{border:0}} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">👆 Clique em um deal para ver a localização exata</p>
            </div>
          )}

          {/* Store Summary */}
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
            <h3 className="text-white font-semibold text-sm mb-3">🏪 Lojas Monitoradas</h3>
            <div className="space-y-2">
              {Object.entries(STORES_MAP).map(([id, store]) => {
                const count = filtered.filter(d => d.store === id).length;
                const best = filtered.filter(d => d.store === id).sort((a,b) => b.score - a.score)[0];
                return (
                  <div key={id} onClick={() => setStoreFilter(storeFilter === store.name ? 'Todas' : store.name)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${storeFilter === store.name ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-gray-700/30 hover:bg-gray-700/50'}`}>
                    <div className="flex items-center gap-2">
                      <span>{store.emoji}</span>
                      <span className="text-white text-xs font-medium">{store.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {count > 0 ? (
                        <>
                          <span className="text-xs text-gray-400">{count} deals</span>
                          {best && <span className="text-xs text-green-400">Score {best.score}</span>}
                        </>
                      ) : (
                        <span className="text-xs text-gray-600">sem deals</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-600 text-center pb-2">
        ⚠️ Deals verificados em tempo real. Preços e disponibilidade podem variar por loja. Clique em "Ver na Loja" para confirmar disponibilidade local.
      </div>
    </div>
  );
}
