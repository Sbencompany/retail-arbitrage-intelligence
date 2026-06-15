'use client';

import { useState, useMemo } from 'react';

const PRODUCTS = [
  { id: 1, name: 'Sony WH-1000XM5 Headphones', category: 'Eletrônicos', store: 'Best Buy', buyPrice: 199.99, sellPrice: 289.00, profit: 52.20, roi: 26.1, score: 94, recommendation: 'Comprar 15 unidades', date: '2026-06-14', type: 'Online', marketplace: 'Amazon', units: 15, demand: 'Alta' },
  { id: 2, name: 'Apple AirPods Pro (2nd Gen)', category: 'Eletrônicos', store: 'Walmart', buyPrice: 179.99, sellPrice: 249.00, profit: 41.50, roi: 23.1, score: 89, recommendation: 'Comprar 10 unidades', date: '2026-06-14', type: 'Online', marketplace: 'Amazon', units: 10, demand: 'Alta' },
  { id: 3, name: 'Ninja Foodi Air Fryer 8qt', category: 'Casa & Cozinha', store: 'Target', buyPrice: 89.99, sellPrice: 159.99, profit: 47.80, roi: 53.1, score: 97, recommendation: 'Comprar 25 unidades', date: '2026-06-14', type: 'Físico', marketplace: 'Mercado Livre', units: 25, demand: 'Muito Alta' },
  { id: 4, name: 'Instant Pot Duo 7-in-1', category: 'Casa & Cozinha', store: 'Costco', buyPrice: 59.99, sellPrice: 99.95, profit: 24.20, roi: 40.3, score: 72, recommendation: 'Aguardar', date: '2026-06-13', type: 'Físico', marketplace: 'Mercado Livre', units: 0, demand: 'Média' },
  { id: 5, name: 'Dyson V11 Vacuum', category: 'Casa & Limpeza', store: 'Home Depot', buyPrice: 399.99, sellPrice: 599.00, profit: 128.50, roi: 32.1, score: 91, recommendation: 'Comprar 5 unidades', date: '2026-06-13', type: 'Online', marketplace: 'Amazon', units: 5, demand: 'Alta' },
  { id: 6, name: 'KitchenAid Stand Mixer', category: 'Casa & Cozinha', store: 'Target', buyPrice: 249.99, sellPrice: 379.00, profit: 83.20, roi: 33.3, score: 86, recommendation: 'Comprar 8 unidades', date: '2026-06-13', type: 'Físico', marketplace: 'Shopee', units: 8, demand: 'Alta' },
  { id: 7, name: 'Samsung 65" QLED TV', category: 'Eletrônicos', store: 'Best Buy', buyPrice: 799.99, sellPrice: 1199.00, profit: 286.40, roi: 35.8, score: 88, recommendation: 'Comprar 3 unidades', date: '2026-06-12', type: 'Online', marketplace: 'Amazon', units: 3, demand: 'Média' },
  { id: 8, name: 'Lego Technic Set 42143', category: 'Brinquedos', store: 'Walmart', buyPrice: 119.99, sellPrice: 189.00, profit: 44.30, roi: 36.9, score: 82, recommendation: 'Comprar 12 unidades', date: '2026-06-12', type: 'Online', marketplace: 'Mercado Livre', units: 12, demand: 'Alta' },
  { id: 9, name: 'Nike Air Max 2024', category: 'Moda & Calçados', store: 'Nike Outlet', buyPrice: 79.99, sellPrice: 149.00, profit: 48.10, roi: 60.1, score: 95, recommendation: 'Comprar 20 unidades', date: '2026-06-12', type: 'Físico', marketplace: 'Shopee', units: 20, demand: 'Muito Alta' },
  { id: 10, name: 'Vitamix 5200 Blender', category: 'Casa & Cozinha', store: 'Costco', buyPrice: 299.99, sellPrice: 449.00, profit: 104.30, roi: 34.8, score: 79, recommendation: 'Comprar 6 unidades', date: '2026-06-11', type: 'Físico', marketplace: 'Amazon', units: 6, demand: 'Média' },
  { id: 11, name: 'iPad Pro 12.9" M2', category: 'Eletrônicos', store: 'Target', buyPrice: 899.99, sellPrice: 1099.00, profit: 112.40, roi: 12.5, score: 65, recommendation: 'Aguardar', date: '2026-06-11', type: 'Online', marketplace: 'Amazon', units: 0, demand: 'Baixa' },
  { id: 12, name: 'Adidas Ultraboost 23', category: 'Moda & Calçados', store: 'Adidas Outlet', buyPrice: 69.99, sellPrice: 139.00, profit: 47.80, roi: 68.3, score: 98, recommendation: 'Comprar 30 unidades', date: '2026-06-11', type: 'Físico', marketplace: 'Shopee', units: 30, demand: 'Muito Alta' },
];

const CATEGORIES = ['Todas', 'Eletrônicos', 'Casa & Cozinha', 'Casa & Limpeza', 'Brinquedos', 'Moda & Calçados'];
const STORES = ['Todas', 'Best Buy', 'Walmart', 'Target', 'Costco', 'Home Depot', 'Nike Outlet', 'Adidas Outlet'];
const MARKETPLACES = ['Todos', 'Amazon', 'Mercado Livre', 'Shopee'];
const TYPES = ['Todos', 'Online', 'Físico'];
const DEMANDS = ['Todas', 'Muito Alta', 'Alta', 'Média', 'Baixa'];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-green-500' : score >= 75 ? 'bg-blue-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  return <span className={`${color} text-white text-xs font-bold px-2 py-1 rounded-full`}>{score}</span>;
}

function DemandBadge({ demand }: { demand: string }) {
  const styles: Record<string, string> = {
    'Muito Alta': 'bg-green-500/20 text-green-400 border border-green-500/30',
    'Alta': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    'Média': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    'Baixa': 'bg-red-500/20 text-red-400 border border-red-500/30',
  };
  return <span className={`${styles[demand] || ''} text-xs px-2 py-1 rounded-full`}>{demand}</span>;
}

export default function OpportunitiesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [store, setStore] = useState('Todas');
  const [marketplace, setMarketplace] = useState('Todos');
  const [type, setType] = useState('Todos');
  const [demand, setDemand] = useState('Todas');
  const [minRoi, setMinRoi] = useState('');
  const [maxRoi, setMaxRoi] = useState('');
  const [minMargin, setMinMargin] = useState('');
  const [maxMargin, setMaxMargin] = useState('');
  const [minScore, setMinScore] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(true);

  const filtered = useMemo(() => {
    let data = [...PRODUCTS];
    if (search) data = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.store.toLowerCase().includes(search.toLowerCase()));
    if (category !== 'Todas') data = data.filter(p => p.category === category);
    if (store !== 'Todas') data = data.filter(p => p.store === store);
    if (marketplace !== 'Todos') data = data.filter(p => p.marketplace === marketplace);
    if (type !== 'Todos') data = data.filter(p => p.type === type);
    if (demand !== 'Todas') data = data.filter(p => p.demand === demand);
    if (minRoi) data = data.filter(p => p.roi >= Number(minRoi));
    if (maxRoi) data = data.filter(p => p.roi <= Number(maxRoi));
    if (minMargin) data = data.filter(p => p.profit >= Number(minMargin));
    if (maxMargin) data = data.filter(p => p.profit <= Number(maxMargin));
    if (minScore) data = data.filter(p => p.score >= Number(minScore));
    if (dateFrom) data = data.filter(p => p.date >= dateFrom);
    if (dateTo) data = data.filter(p => p.date <= dateTo);
    
    data.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];
      if (typeof aVal === 'number') return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
      return sortDir === 'desc' ? String(bVal).localeCompare(String(aVal)) : String(aVal).localeCompare(String(bVal));
    });
    return data;
  }, [search, category, store, marketplace, type, demand, minRoi, maxRoi, minMargin, maxMargin, minScore, dateFrom, dateTo, sortBy, sortDir]);

  const totalProfit = filtered.reduce((s, p) => s + p.profit, 0);
  const avgRoi = filtered.length ? filtered.reduce((s, p) => s + p.roi, 0) / filtered.length : 0;

  const clearFilters = () => {
    setSearch(''); setCategory('Todas'); setStore('Todas'); setMarketplace('Todos');
    setType('Todos'); setDemand('Todas'); setMinRoi(''); setMaxRoi('');
    setMinMargin(''); setMaxMargin(''); setMinScore(''); setDateFrom(''); setDateTo('');
  };

  const handleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const SortIcon = ({ col }: { col: string }) => (
    <span className="ml-1 text-gray-500">
      {sortBy === col ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ' ↕'}
    </span>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">🎯 Oportunidades</h1>
          <p className="text-gray-400 text-sm mt-1">Produtos com alto potencial de lucro detectados automaticamente</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(f => !f)} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
            <span>🔧</span> {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
          <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg text-sm transition-colors">
            <span>✕</span> Limpar Filtros
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{filtered.length}</div>
          <div className="text-xs text-gray-400">Resultados</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{avgRoi.toFixed(1)}%</div>
          <div className="text-xs text-gray-400">ROI Médio</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">${totalProfit.toFixed(0)}</div>
          <div className="text-xs text-gray-400">Lucro Total</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{filtered.filter(p => p.score >= 90).length}</div>
          <div className="text-xs text-gray-400">Score 90+</div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">🔍 Filtros Avançados</h3>
          
          {/* Row 1: Search + Category + Store */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Buscar Produto / Loja</label>
              <input
                type="text"
                placeholder="Digite para buscar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Categoria</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Loja de Compra</label>
              <select value={store} onChange={e => setStore(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
                {STORES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2: Marketplace + Type + Demand */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Marketplace de Venda</label>
              <select value={marketplace} onChange={e => setMarketplace(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
                {MARKETPLACES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Tipo de Arbitragem</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Demanda</label>
              <select value={demand} onChange={e => setDemand(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
                {DEMANDS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3: ROI Range + Margin Range + Score */}
          <div className="grid grid-cols-5 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">ROI Mínimo (%)</label>
              <input type="number" placeholder="Ex: 20" value={minRoi} onChange={e => setMinRoi(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">ROI Máximo (%)</label>
              <input type="number" placeholder="Ex: 80" value={maxRoi} onChange={e => setMaxRoi(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Margem Mín. ($)</label>
              <input type="number" placeholder="Ex: 30" value={minMargin} onChange={e => setMinMargin(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Margem Máx. ($)</label>
              <input type="number" placeholder="Ex: 200" value={maxMargin} onChange={e => setMaxMargin(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Score Mínimo IA</label>
              <input type="number" placeholder="Ex: 80" value={minScore} onChange={e => setMinScore(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-500" />
            </div>
          </div>

          {/* Row 4: Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Data De</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Data Até</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs text-gray-500">Filtros rápidos:</span>
            <button onClick={() => { setMinRoi('30'); setMinScore('85'); }} className="text-xs px-3 py-1 bg-green-600/20 text-green-400 border border-green-600/30 rounded-full hover:bg-green-600/30 transition-colors">🔥 Alta Performance (ROI 30%+ / Score 85+)</button>
            <button onClick={() => { setDemand('Muito Alta'); setType('Físico'); }} className="text-xs px-3 py-1 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-full hover:bg-purple-600/30 transition-colors">🏪 Físico + Demanda Muito Alta</button>
            <button onClick={() => { setMinRoi('50'); }} className="text-xs px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-full hover:bg-blue-600/30 transition-colors">💰 ROI Acima de 50%</button>
            <button onClick={() => { setDateFrom('2026-06-14'); }} className="text-xs px-3 py-1 bg-orange-600/20 text-orange-400 border border-orange-600/30 rounded-full hover:bg-orange-600/30 transition-colors">📅 Apenas Hoje</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900/60 text-gray-400 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left cursor-pointer hover:text-white" onClick={() => handleSort('name')}>Produto <SortIcon col="name" /></th>
                <th className="px-4 py-3 text-left cursor-pointer hover:text-white" onClick={() => handleSort('category')}>Categoria <SortIcon col="category" /></th>
                <th className="px-4 py-3 text-left cursor-pointer hover:text-white" onClick={() => handleSort('store')}>Loja <SortIcon col="store" /></th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('buyPrice')}>Compra <SortIcon col="buyPrice" /></th>
                <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('sellPrice')}>Venda <SortIcon col="sellPrice" /></th>
                <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('profit')}>Lucro <SortIcon col="profit" /></th>
                <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('roi')}>ROI <SortIcon col="roi" /></th>
                <th className="px-4 py-3 text-left cursor-pointer hover:text-white" onClick={() => handleSort('demand')}>Demanda <SortIcon col="demand" /></th>
                <th className="px-4 py-3 text-center cursor-pointer hover:text-white" onClick={() => handleSort('score')}>Score <SortIcon col="score" /></th>
                <th className="px-4 py-3 text-left">Marketplace</th>
                <th className="px-4 py-3 text-left">Rec. IA</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">🔍</div>
                    <div>Nenhuma oportunidade encontrada com os filtros aplicados</div>
                    <button onClick={clearFilters} className="mt-3 text-blue-400 hover:text-blue-300 text-sm underline">Limpar filtros</button>
                  </td>
                </tr>
              ) : filtered.map((p, i) => (
                <tr key={p.id} className={`border-t border-gray-700/30 ${i % 2 === 0 ? 'bg-transparent' : 'bg-gray-900/20'} hover:bg-gray-700/30 transition-colors`}>
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{p.name}</div>
                    <div className="text-gray-500 text-xs">{p.date}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">{p.category}</td>
                  <td className="px-4 py-3 text-gray-400">{p.store}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.type === 'Físico' ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                      {p.type === 'Físico' ? '🏪' : '🌐'} {p.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">${p.buyPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-gray-300">${p.sellPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-green-400 font-semibold">${p.profit.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${p.roi >= 50 ? 'text-green-400' : p.roi >= 30 ? 'text-blue-400' : 'text-yellow-400'}`}>
                      {p.roi.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3"><DemandBadge demand={p.demand} /></td>
                  <td className="px-4 py-3 text-center"><ScoreBadge score={p.score} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{p.marketplace}</td>
                  <td className="px-4 py-3 text-gray-300 text-xs">{p.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 bg-gray-900/40 border-t border-gray-700/30 flex items-center justify-between text-xs text-gray-500">
            <span>{filtered.length} oportunidade{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}</span>
            <span>Lucro total filtrado: <span className="text-green-400 font-semibold">${totalProfit.toFixed(2)}</span> · ROI médio: <span className="text-blue-400 font-semibold">{avgRoi.toFixed(1)}%</span></span>
          </div>
        )}
      </div>
    </div>
  );
}
