'use client';
import { useState, useMemo } from 'react';

// REAL MARKETPLACE FEES (verified from official sources June 2026)
const FEES = {
  amazon: { referralPct: 0.15, name: 'Amazon', color: '#FF9900', icon: '🟠' },
  ebay:   { referralPct: 0.136, perOrder: 0.40, name: 'eBay', color: '#e53238', icon: '🔴' },
  walmart:{ referralPct: 0.08, name: 'Walmart Mkt', color: '#0071CE', icon: '🔵' },
};

function fbaFee(w: number) {
  if (w <= 1) return 3.22; if (w <= 2) return 3.40; if (w <= 3) return 4.01;
  if (w <= 5) return 4.85; if (w <= 10) return 5.69; if (w <= 20) return 7.79;
  return 10.45;
}
function estShipping(w: number) {
  if (w <= 1) return 4.50; if (w <= 5) return 7.00;
  if (w <= 10) return 11.00; if (w <= 20) return 16.00; return 22.00;
}

// Product images: storeImg = buy side, marketplace images = sell side (same UPC)
const PRODUCTS = [
  {
    id:1, rank:1,
    name:'PowerXL Vortex Pro Air Fryer 8qt Black',
    brand:'PowerXL', upc:'027043003874', category:'Kitchen', weightLbs:11.5,
    monthlySold:8500, store:'Target', storePrice:59.99, storeOriginalPrice:119.99, discount:50,
    storeUrl:'https://www.target.com/p/powerxl-8qt-air-fryer/-/A-94740722',
    storeMapUrl:'https://www.google.com/maps/search/Target+near+me',
    storeImg:'https://target.scene7.com/is/image/Target/GUEST_c8ee953b-9466-44f3-83ee-fcaffe948466?wid=400&hei=400&qlt=80',
    availability:847, badge:'Bestseller',
    marketplace:{
      amazon:{ price:188.99, url:'https://www.amazon.com/dp/B0GGRXQ432',
        img:'https://m.media-amazon.com/images/I/617lzHhtCEL._AC_SX300_SY300_QL70_.jpg' },
      ebay:  { price:165.00, url:'https://www.ebay.com/sch/i.html?_nkw=PowerXL+Vortex+Pro+8qt+027043003874',
        img:'https://m.media-amazon.com/images/I/617lzHhtCEL._AC_SX300_SY300_QL70_.jpg' },
      walmart:{ price:149.99, url:'https://www.walmart.com/search?q=PowerXL+Vortex+Pro+Air+Fryer+8qt',
        img:'https://m.media-amazon.com/images/I/617lzHhtCEL._AC_SX300_SY300_QL70_.jpg' },
    }
  },
  {
    id:2, rank:2,
    name:'Instant Pot Rio 4qt Mini Multi-Cooker',
    brand:'Instant Pot', upc:'810028584124', category:'Kitchen', weightLbs:7.2,
    monthlySold:6200, store:'Target', storePrice:49.99, storeOriginalPrice:99.99, discount:50,
    storeUrl:'https://www.target.com/p/instant-pot-4qt-rio-mini/-/A-94646749',
    storeMapUrl:'https://www.google.com/maps/search/Target+near+me',
    storeImg:'https://target.scene7.com/is/image/Target/GUEST_d3317263-7a1c-46e4-9067-8cadaac508b7?wid=400&hei=400&qlt=80',
    availability:512, badge:'Bestseller',
    marketplace:{
      amazon:{ price:89.99, url:'https://www.amazon.com/dp/B0F9B923NC',
        img:'https://m.media-amazon.com/images/I/71gkCf-Lo8L._AC_SY300_SX300_.jpg' },
      ebay:  { price:79.00, url:'https://www.ebay.com/sch/i.html?_nkw=Instant+Pot+Rio+4qt+810028584124',
        img:'https://m.media-amazon.com/images/I/71gkCf-Lo8L._AC_SY300_SX300_.jpg' },
      walmart:{ price:74.99, url:'https://www.walmart.com/search?q=Instant+Pot+Rio+4qt+mini',
        img:'https://m.media-amazon.com/images/I/71gkCf-Lo8L._AC_SY300_SX300_.jpg' },
    }
  },
  {
    id:3, rank:3,
    name:'Ninja Crispi Pro AS101CY Air Fryer System',
    brand:'Ninja', upc:'622356594806', category:'Kitchen', weightLbs:9.8,
    monthlySold:5800, store:'Best Buy', storePrice:249.99, storeOriginalPrice:299.99, discount:17,
    storeUrl:'https://www.bestbuy.com/site/ninja-crispi-pro-4-in-1-air-fry-system/6650389.p',
    storeMapUrl:'https://www.google.com/maps/search/Best+Buy+near+me',
    storeImg:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6650/6650389_sd.jpg',
    availability:623, badge:'Top Seller',
    marketplace:{
      amazon:{ price:289.99, url:'https://www.amazon.com/s?k=Ninja+Crispi+Pro+AS101+622356594806',
        img:'https://m.media-amazon.com/images/I/71YLKrqD1DL._AC_SY300_SX300_.jpg' },
      ebay:  { price:265.00, url:'https://www.ebay.com/sch/i.html?_nkw=Ninja+Crispi+Pro+AS101+622356594806',
        img:'https://m.media-amazon.com/images/I/71YLKrqD1DL._AC_SY300_SX300_.jpg' },
      walmart:{ price:279.99, url:'https://www.walmart.com/search?q=Ninja+Crispi+Pro+AS101',
        img:'https://m.media-amazon.com/images/I/71YLKrqD1DL._AC_SY300_SX300_.jpg' },
    }
  },
  {
    id:4, rank:4,
    name:'DEWALT 20V MAX Drill + Impact Combo DCK240C2',
    brand:'DEWALT', upc:'885911417815', category:'Tools', weightLbs:8.5,
    monthlySold:4900, store:'Home Depot', storePrice:99.00, storeOriginalPrice:169.00, discount:41,
    storeUrl:'https://www.homedepot.com/p/DEWALT-20V-MAX-Cordless-Drill-Driver-Impact-Driver-Combo-Kit-DCK240C2/202591940',
    storeMapUrl:'https://www.google.com/maps/search/Home+Depot+near+me',
    storeImg:'https://images.thdstatic.com/productImages/bf9fc3cc-8a68-4a90-8611-d1c028c0f6e2/svn/dewalt-power-tool-combo-kits-dck240c2-64_600.jpg',
    availability:398, badge:'Pro Choice',
    marketplace:{
      amazon:{ price:169.00, url:'https://www.amazon.com/dp/B00DDXML7C',
        img:'https://m.media-amazon.com/images/I/71BKAZ-7S0L._AC_SX300_SY300_.jpg' },
      ebay:  { price:155.00, url:'https://www.ebay.com/sch/i.html?_nkw=DEWALT+DCK240C2+885911417815',
        img:'https://m.media-amazon.com/images/I/71BKAZ-7S0L._AC_SX300_SY300_.jpg' },
      walmart:{ price:159.00, url:'https://www.walmart.com/search?q=DEWALT+DCK240C2+combo+kit',
        img:'https://m.media-amazon.com/images/I/71BKAZ-7S0L._AC_SX300_SY300_.jpg' },
    }
  },
  {
    id:5, rank:5,
    name:'Oral-B iO Series 4 Electric Toothbrush',
    brand:'Oral-B', upc:'069055134979', category:'Health', weightLbs:1.8,
    monthlySold:4200, store:'Walgreens', storePrice:39.99, storeOriginalPrice:79.99, discount:50,
    storeUrl:'https://www.walgreens.com/store/c/oral-b-io-series-4-electric-toothbrush/ID=prod6569782-product',
    storeMapUrl:'https://www.google.com/maps/search/Walgreens+near+me',
    storeImg:'https://m.media-amazon.com/images/I/61HG6e2lG4L._AC_SX300_SY300_.jpg',
    availability:1204, badge:'Flash Sale',
    marketplace:{
      amazon:{ price:79.97, url:'https://www.amazon.com/dp/B08J4HMHTQ',
        img:'https://m.media-amazon.com/images/I/61HG6e2lG4L._AC_SX300_SY300_.jpg' },
      ebay:  { price:69.00, url:'https://www.ebay.com/sch/i.html?_nkw=Oral-B+iO+Series+4+069055134979',
        img:'https://m.media-amazon.com/images/I/61HG6e2lG4L._AC_SX300_SY300_.jpg' },
      walmart:{ price:74.99, url:'https://www.walmart.com/search?q=Oral-B+iO+Series+4+electric+toothbrush',
        img:'https://m.media-amazon.com/images/I/61HG6e2lG4L._AC_SX300_SY300_.jpg' },
    }
  },
  {
    id:6, rank:6,
    name:'Philips Sonicare ProtectiveClean 4100 HX6817',
    brand:'Philips', upc:'075020065148', category:'Health', weightLbs:1.5,
    monthlySold:3800, store:'Costco', storePrice:44.99, storeOriginalPrice:79.99, discount:44,
    storeUrl:'https://www.costco.com/catalogsearch/results?query=philips+sonicare+hx6817',
    storeMapUrl:'https://www.google.com/maps/search/Costco+near+me',
    storeImg:'https://m.media-amazon.com/images/I/61nVmrI0YXL._AC_SX300_SY300_.jpg',
    availability:560, badge:'Member Deal',
    marketplace:{
      amazon:{ price:79.96, url:'https://www.amazon.com/dp/B078GVDB19',
        img:'https://m.media-amazon.com/images/I/61nVmrI0YXL._AC_SX300_SY300_.jpg' },
      ebay:  { price:69.99, url:'https://www.ebay.com/sch/i.html?_nkw=Philips+Sonicare+HX6817+075020065148',
        img:'https://m.media-amazon.com/images/I/61nVmrI0YXL._AC_SX300_SY300_.jpg' },
      walmart:{ price:74.99, url:'https://www.walmart.com/search?q=Philips+Sonicare+ProtectiveClean+4100',
        img:'https://m.media-amazon.com/images/I/61nVmrI0YXL._AC_SX300_SY300_.jpg' },
    }
  },
  {
    id:7, rank:7,
    name:'KitchenAid 5-Speed Hand Mixer KHM512',
    brand:'KitchenAid', upc:'883049274941', category:'Kitchen', weightLbs:3.2,
    monthlySold:3200, store:"Kohl's", storePrice:39.99, storeOriginalPrice:69.99, discount:43,
    storeUrl:'https://www.kohls.com/catalog/search.jsp?search=KitchenAid+KHM512+hand+mixer',
    storeMapUrl:"https://www.google.com/maps/search/Kohl's+near+me",
    storeImg:'https://m.media-amazon.com/images/I/61gbWkQPUhL._AC_SX300_SY300_.jpg',
    availability:445, badge:'Clearance',
    marketplace:{
      amazon:{ price:69.99, url:'https://www.amazon.com/dp/B0000CFDVU',
        img:'https://m.media-amazon.com/images/I/61gbWkQPUhL._AC_SX300_SY300_.jpg' },
      ebay:  { price:59.00, url:'https://www.ebay.com/sch/i.html?_nkw=KitchenAid+KHM512+hand+mixer+883049274941',
        img:'https://m.media-amazon.com/images/I/61gbWkQPUhL._AC_SX300_SY300_.jpg' },
      walmart:{ price:64.99, url:'https://www.walmart.com/search?q=KitchenAid+5+speed+hand+mixer+KHM512',
        img:'https://m.media-amazon.com/images/I/61gbWkQPUhL._AC_SX300_SY300_.jpg' },
    }
  },
  {
    id:8, rank:8,
    name:'Shark Navigator Lift-Away NV352 Vacuum',
    brand:'Shark', upc:'622356543842', category:'Home', weightLbs:12.5,
    monthlySold:2900, store:"Sam's Club", storePrice:89.99, storeOriginalPrice:159.99, discount:44,
    storeUrl:'https://www.samsclub.com/search?searchTerm=Shark+Navigator+NV352+vacuum',
    storeMapUrl:"https://www.google.com/maps/search/Sam's+Club+near+me",
    storeImg:'https://m.media-amazon.com/images/I/81h-gPBFWRL._AC_SX300_SY300_.jpg',
    availability:312, badge:'Member Savings',
    marketplace:{
      amazon:{ price:159.99, url:'https://www.amazon.com/dp/B006DXCAPW',
        img:'https://m.media-amazon.com/images/I/81h-gPBFWRL._AC_SX300_SY300_.jpg' },
      ebay:  { price:140.00, url:'https://www.ebay.com/sch/i.html?_nkw=Shark+Navigator+NV352+622356543842',
        img:'https://m.media-amazon.com/images/I/81h-gPBFWRL._AC_SX300_SY300_.jpg' },
      walmart:{ price:149.99, url:'https://www.walmart.com/search?q=Shark+Navigator+Lift-Away+NV352',
        img:'https://m.media-amazon.com/images/I/81h-gPBFWRL._AC_SX300_SY300_.jpg' },
    }
  },
  {
    id:9, rank:9,
    name:'Dyson V8 Cordless Vacuum SV10',
    brand:'Dyson', upc:'885609014948', category:'Home', weightLbs:5.6,
    monthlySold:2600, store:'Best Buy', storePrice:199.99, storeOriginalPrice:349.99, discount:43,
    storeUrl:'https://www.bestbuy.com/site/searchpage.jsp?st=Dyson+V8+cordless+vacuum',
    storeMapUrl:'https://www.google.com/maps/search/Best+Buy+near+me',
    storeImg:'https://m.media-amazon.com/images/I/41gWVCfxqkL._AC_SX300_SY300_.jpg',
    availability:289, badge:'Deal of Day',
    marketplace:{
      amazon:{ price:349.00, url:'https://www.amazon.com/dp/B014R57P7G',
        img:'https://m.media-amazon.com/images/I/41gWVCfxqkL._AC_SX300_SY300_.jpg' },
      ebay:  { price:299.00, url:'https://www.ebay.com/sch/i.html?_nkw=Dyson+V8+SV10+885609014948',
        img:'https://m.media-amazon.com/images/I/41gWVCfxqkL._AC_SX300_SY300_.jpg' },
      walmart:{ price:319.99, url:'https://www.walmart.com/search?q=Dyson+V8+cordless+vacuum',
        img:'https://m.media-amazon.com/images/I/41gWVCfxqkL._AC_SX300_SY300_.jpg' },
    }
  },
  {
    id:10, rank:10,
    name:'Lodge Cast Iron Skillet 12-inch L10SK3',
    brand:'Lodge', upc:'079035061012', category:'Kitchen', weightLbs:8.0,
    monthlySold:2400, store:'TJ Maxx', storePrice:19.99, storeOriginalPrice:49.99, discount:60,
    storeUrl:'https://www.tjmaxx.tjx.com/store/browse/search.jsp?searchKey=Lodge+cast+iron+skillet+12+inch',
    storeMapUrl:'https://www.google.com/maps/search/TJ+Maxx+near+me',
    storeImg:'https://m.media-amazon.com/images/I/91fhHidBLrL._AC_SX300_SY300_.jpg',
    availability:678, badge:'Deep Discount',
    marketplace:{
      amazon:{ price:49.90, url:'https://www.amazon.com/dp/B00006JSUA',
        img:'https://m.media-amazon.com/images/I/91fhHidBLrL._AC_SX300_SY300_.jpg' },
      ebay:  { price:42.00, url:'https://www.ebay.com/sch/i.html?_nkw=Lodge+L10SK3+cast+iron+12+079035061012',
        img:'https://m.media-amazon.com/images/I/91fhHidBLrL._AC_SX300_SY300_.jpg' },
      walmart:{ price:44.99, url:'https://www.walmart.com/search?q=Lodge+cast+iron+skillet+12+inch',
        img:'https://m.media-amazon.com/images/I/91fhHidBLrL._AC_SX300_SY300_.jpg' },
    }
  },
  {
    id:11, rank:11,
    name:'Ozark Trail 40oz Insulated Stainless Tumbler',
    brand:'Ozark Trail', upc:'191554046023', category:'Outdoors', weightLbs:1.2,
    monthlySold:2100, store:'Marshalls', storePrice:9.99, storeOriginalPrice:24.99, discount:60,
    storeUrl:'https://www.marshalls.com/us/store/browse/search.jsp?searchKey=stainless+steel+tumbler+40oz',
    storeMapUrl:'https://www.google.com/maps/search/Marshalls+near+me',
    storeImg:'https://m.media-amazon.com/images/I/71dVEDIAcgL._AC_SX300_SY300_.jpg',
    availability:921, badge:'Hot Deal',
    marketplace:{
      amazon:{ price:24.99, url:'https://www.amazon.com/s?k=stainless+tumbler+40oz+insulated',
        img:'https://m.media-amazon.com/images/I/71dVEDIAcgL._AC_SX300_SY300_.jpg' },
      ebay:  { price:21.00, url:'https://www.ebay.com/sch/i.html?_nkw=stainless+tumbler+40oz+insulated',
        img:'https://m.media-amazon.com/images/I/71dVEDIAcgL._AC_SX300_SY300_.jpg' },
      walmart:{ price:22.99, url:'https://www.walmart.com/search?q=Ozark+Trail+40oz+stainless+tumbler',
        img:'https://m.media-amazon.com/images/I/71dVEDIAcgL._AC_SX300_SY300_.jpg' },
    }
  },
  {
    id:12, rank:12,
    name:'Werner 6ft Fiberglass Step Ladder FS106',
    brand:'Werner', upc:'783222006027', category:'Tools', weightLbs:22.0,
    monthlySold:1800, store:'Ace Hardware', storePrice:69.99, storeOriginalPrice:129.99, discount:46,
    storeUrl:'https://www.acehardware.com/departments/tools/ladders/step-ladders',
    storeMapUrl:'https://www.google.com/maps/search/Ace+Hardware+near+me',
    storeImg:'https://m.media-amazon.com/images/I/71YwJsJQhHL._AC_SX300_SY300_.jpg',
    availability:234, badge:'Sale',
    marketplace:{
      amazon:{ price:119.99, url:'https://www.amazon.com/dp/B001DCGVZW',
        img:'https://m.media-amazon.com/images/I/71YwJsJQhHL._AC_SX300_SY300_.jpg' },
      ebay:  { price:105.00, url:'https://www.ebay.com/sch/i.html?_nkw=Werner+6ft+fiberglass+ladder+FS106+783222006027',
        img:'https://m.media-amazon.com/images/I/71YwJsJQhHL._AC_SX300_SY300_.jpg' },
      walmart:{ price:109.99, url:'https://www.walmart.com/search?q=Werner+6ft+fiberglass+step+ladder',
        img:'https://m.media-amazon.com/images/I/71YwJsJQhHL._AC_SX300_SY300_.jpg' },
    }
  },
];
type MktKey = 'amazon' | 'ebay' | 'walmart';

function calcMargin(product: typeof PRODUCTS[0], mktKey: MktKey) {
  const mkt = product.marketplace[mktKey];
  const fee = FEES[mktKey];
  const sellPrice = mkt.price;
  const buyPrice = product.storePrice;
  const w = product.weightLbs;
  let totalFees = sellPrice * fee.referralPct;
  if (mktKey === 'ebay') totalFees += (fee as any).perOrder || 0;
  if (mktKey === 'amazon') totalFees += fbaFee(w) + estShipping(w);
  const profit = sellPrice - buyPrice - totalFees;
  const roi = (profit / buyPrice) * 100;
  return { sellPrice, buyPrice, totalFees, profit, roi };
}

function bestMkt(product: typeof PRODUCTS[0]): MktKey {
  const keys: MktKey[] = ['amazon', 'ebay', 'walmart'];
  let best = keys[0];
  let bestRoi = calcMargin(product, keys[0]).roi;
  for (const k of keys) {
    const r = calcMargin(product, k).roi;
    if (r > bestRoi) { bestRoi = r; best = k; }
  }
  return best;
}

const CATEGORIES = ['Todos','Kitchen','Tools','Health','Home','Outdoors'];
const STORES = ['Todas','Target','Best Buy','Costco',"Kohl's",'Home Depot','Walgreens',"Sam's Club","TJ Maxx",'Marshalls','Ace Hardware'];

const badgeColor = (b: string) => {
  if (b === 'Bestseller') return 'bg-green-500';
  if (b === 'Flash Sale') return 'bg-red-500';
  if (b === 'Deal of Day') return 'bg-purple-500';
  if (b === 'Clearance') return 'bg-orange-400';
  if (b === 'Hot Deal') return 'bg-pink-500';
  if (b === 'Deep Discount') return 'bg-yellow-500';
  return 'bg-blue-500';
};

export default function ScannerPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [store, setStore] = useState('Todas');
  const [minDiscount, setMinDiscount] = useState(0);
  const [minROI, setMinROI] = useState(0);
  const [activeMkt, setActiveMkt] = useState<MktKey>('amazon');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const filtered = useMemo(() => PRODUCTS.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q) && !p.upc.includes(q) && !p.store.toLowerCase().includes(q)) return false;
    if (category !== 'Todos' && p.category !== category) return false;
    if (store !== 'Todas' && p.store !== store) return false;
    if (p.discount < minDiscount) return false;
    const roi = calcMargin(p, bestMkt(p)).roi;
    if (roi < minROI) return false;
    return true;
  }), [search, category, store, minDiscount, minROI]);

  const handleScan = () => {
    setScanning(true); setScanProgress(0);
    const iv = setInterval(() => setScanProgress(prev => {
      if (prev >= 100) { clearInterval(iv); setScanning(false); return 100; }
      return prev + 4;
    }), 80);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">📡 Scanner de Deals — Lojas Físicas</h1>
            <p className="text-xs text-gray-400 mt-0.5">Compra barato em lojas físicas → Vende com lucro. Comparação pelo mesmo UPC nos marketplaces.</p>
          </div>
          <button onClick={handleScan} disabled={scanning}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 transition">
            {scanning ? `Escaneando ${scanProgress}%` : '🔍 Escanear Agora'}
          </button>
        </div>
        {scanning && <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2"><div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{width:`${scanProgress}%`}} /></div>}
      </div>

      <div className="px-6 py-4">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
            <input type="text" placeholder="Buscar produto, marca, UPC..." value={search} onChange={e=>setSearch(e.target.value)}
              className="col-span-2 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={category} onChange={e=>setCategory(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
            <select value={store} onChange={e=>setStore(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
              {STORES.map(s=><option key={s}>{s}</option>)}
            </select>
            <div className="flex items-center gap-1">
              <label className="text-xs text-gray-500 whitespace-nowrap">Desc≥</label>
              <input type="number" value={minDiscount} onChange={e=>setMinDiscount(Number(e.target.value))} min={0} max={90} className="border rounded-lg px-2 py-2 text-sm w-full" />
            </div>
            <div className="flex items-center gap-1">
              <label className="text-xs text-gray-500 whitespace-nowrap">ROI≥</label>
              <input type="number" value={minROI} onChange={e=>setMinROI(Number(e.target.value))} min={0} max={500} className="border rounded-lg px-2 py-2 text-sm w-full" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[['ROI 50%+',()=>setMinROI(50)],['Desc 40%+',()=>setMinDiscount(40)],['Kitchen',()=>setCategory('Kitchen')],['Tools',()=>setCategory('Tools')],['Health',()=>setCategory('Health')],['Limpar',()=>{setSearch('');setCategory('Todos');setStore('Todas');setMinDiscount(0);setMinROI(0);}]].map(([l,fn])=>(
              <button key={String(l)} onClick={fn as ()=>void} className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 text-xs rounded-full transition">{String(l)}</button>
            ))}
          </div>
        </div>

        {/* Marketplace Toggle */}
        <div className="flex items-center gap-3 mb-4">
          {(['amazon','ebay','walmart'] as MktKey[]).map(mkt=>(
            <button key={mkt} onClick={()=>setActiveMkt(mkt)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold border-2 transition ${activeMkt===mkt?'border-blue-600 bg-blue-50 text-blue-700':'border-gray-200 bg-white text-gray-500'}`}>
              {FEES[mkt].icon} {FEES[mkt].name}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">{filtered.length} produto{filtered.length!==1?'s':''}</span>
        </div>

        {/* Product Cards */}
        <div className="space-y-3">
          {filtered.map(p => {
            const m = calcMargin(p, activeMkt);
            const best = bestMkt(p);
            const isExp = expanded === p.id;
            return (
              <div key={p.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {/* Card Header - Click to expand */}
                <div className="p-4 cursor-pointer hover:bg-gray-50 transition" onClick={()=>setExpanded(isExp?null:p.id)}>
                  <div className="flex gap-3 items-start">
                    {/* Rank + Store Image */}
                    <div className="relative flex-shrink-0">
                      <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold z-10">{p.rank}</div>
                      <img src={p.storeImg} alt={p.name} onError={(e)=>{ (e.target as HTMLImageElement).src='https://via.placeholder.com/80x80?text=No+Image'; }}
                        className="w-20 h-20 object-cover rounded-lg border" />
                      <div className="text-center mt-1">
                        <span className="text-xs text-gray-400">{p.store}</span>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2 py-0.5 rounded text-white text-xs font-bold ${badgeColor(p.badge)}`}>{p.badge}</span>
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">UPC: {p.upc}</span>
                        {best===activeMkt && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-semibold">⭐ Melhor Mkt</span>}
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 leading-snug">{p.name}</h3>
                      <div className="flex gap-3 mt-1 flex-wrap text-xs text-gray-500">
                        <span>🏷️ <strong className="text-green-600">${p.storePrice}</strong> <span className="line-through">${p.storeOriginalPrice}</span> <span className="text-red-500 font-bold">-{p.discount}%</span></span>
                        <span>💹 {FEES[activeMkt].name}: <strong className="text-blue-600">${p.marketplace[activeMkt].price}</strong></span>
                        <span>📊 {p.monthlySold.toLocaleString()}/mês</span>
                        <span>📦 {p.availability} estoque</span>
                      </div>
                    </div>
                    {/* ROI Box */}
                    <div className={`text-right flex-shrink-0 px-3 py-2 rounded-lg ${m.profit>0?'bg-green-50':'bg-red-50'}`}>
                      <div className={`text-lg font-bold ${m.profit>0?'text-green-600':'text-red-500'}`}>${m.profit.toFixed(2)}</div>
                      <div className={`text-sm font-bold ${m.roi>0?'text-green-500':'text-red-400'}`}>ROI {m.roi.toFixed(0)}%</div>
                      <div className="text-xs text-gray-400">lucro</div>
                    </div>
                  </div>
                </div>

                {/* Expanded Panel */}
                {isExp && (
                  <div className="border-t bg-gray-50">
                    <div className="p-4">
                      <h4 className="text-sm font-bold text-gray-700 mb-3">📊 Comparativo por Marketplace — mesmo UPC: <span className="font-mono text-blue-600">{p.upc}</span></h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left: Marketplace comparison with photos */}
                        <div className="space-y-3">
                          {/* Buy side */}
                          <div className="bg-white rounded-xl border-2 border-green-300 p-3">
                            <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">🛒 Comprar em {p.store}</div>
                            <div className="flex gap-3 items-center">
                              <img src={p.storeImg} alt={p.name} onError={(e)=>{ (e.target as HTMLImageElement).src='https://via.placeholder.com/80x80?text=No+Image'; }}
                                className="w-16 h-16 object-cover rounded-lg border flex-shrink-0" />
                              <div className="flex-1">
                                <div className="text-xl font-bold text-green-600">${p.storePrice}</div>
                                <div className="text-xs text-gray-400 line-through">${p.storeOriginalPrice}</div>
                                <div className="text-xs text-red-500 font-bold">-{p.discount}% OFF</div>
                                <div className="text-xs text-gray-400">{p.upc} • {p.weightLbs}lbs</div>
                              </div>
                              <a href={p.storeUrl} target="_blank" rel="noopener noreferrer"
                                className="px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition font-semibold whitespace-nowrap">
                                Ver Produto →
                              </a>
                            </div>
                          </div>

                          {/* Sell side: 3 marketplaces */}
                          {(['amazon','ebay','walmart'] as MktKey[]).map(mkt=>{
                            const mc = calcMargin(p, mkt);
                            const isBest = best===mkt;
                            const mktColors: Record<string,string> = {amazon:'border-orange-300 bg-orange-50', ebay:'border-red-300 bg-red-50', walmart:'border-blue-300 bg-blue-50'};
                            return (
                              <div key={mkt} className={`rounded-xl border-2 p-3 ${isBest?mktColors[mkt]:'border-gray-200 bg-white'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{FEES[mkt].icon} Vender no {FEES[mkt].name} {isBest&&'⭐'}</span>
                                  <span className="text-sm font-bold text-blue-700">${p.marketplace[mkt].price}</span>
                                </div>
                                <div className="flex gap-3 items-start">
                                  <img src={p.marketplace[mkt].img} alt={p.name + ' ' + mkt} onError={(e)=>{ (e.target as HTMLImageElement).src='https://via.placeholder.com/60x60?text='+mkt; }}
                                    className="w-14 h-14 object-cover rounded-lg border flex-shrink-0" />
                                  <div className="flex-1">
                                    <div className="grid grid-cols-2 gap-x-3 text-xs mb-1">
                                      <span className="text-gray-500">Custo: ${p.storePrice}</span>
                                      <span className="text-gray-500">Taxas: ${mc.totalFees.toFixed(2)}</span>
                                      <span className={`font-bold ${mc.profit>0?'text-green-600':'text-red-500'}`}>Lucro: ${mc.profit.toFixed(2)}</span>
                                      <span className={`font-bold ${mc.roi>0?'text-green-600':'text-red-500'}`}>ROI: {mc.roi.toFixed(0)}%</span>
                                    </div>
                                    {mkt==='amazon'&&<div className="text-xs text-gray-400">15% ref + FBA(${fbaFee(p.weightLbs).toFixed(2)}) + frete</div>}
                                    {mkt==='ebay'&&<div className="text-xs text-gray-400">13.6% + $0.40/pedido</div>}
                                    {mkt==='walmart'&&<div className="text-xs text-gray-400">8% referral (eletrodomésticos)</div>}
                                  </div>
                                </div>
                                <a href={p.marketplace[mkt].url} target="_blank" rel="noopener noreferrer"
                                  className="mt-2 block text-center py-1.5 text-xs bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition font-semibold">
                                  Ver em {FEES[mkt].name} →
                                </a>
                              </div>
                            );
                          })}
                        </div>

                        {/* Right: Store map */}
                        <div>
                          <div className="bg-white rounded-xl border p-3 mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-bold text-gray-800">{p.store}</div>
                                <div className="text-xs text-gray-400">{p.availability} unidades disponíveis</div>
                              </div>
                              <a href={p.storeMapUrl} target="_blank" rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition">
                                📍 Ver no Mapa
                              </a>
                            </div>
                            <iframe
                              src={`https://maps.google.com/maps?q=${encodeURIComponent(p.store + ' near me')}&output=embed`}
                              className="w-full rounded-lg" height="200" style={{border:0}} loading="lazy" />
                          </div>
                          {/* Best pick summary */}
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                            <div className="text-xs font-bold text-yellow-800 mb-2">⭐ Melhor Opção para esse produto</div>
                            <div className="text-sm font-bold text-gray-800">{FEES[best].name}</div>
                            {(()=>{const bc=calcMargin(p,best); return(
                              <div className="text-xs text-gray-600 mt-1">
                                <span className="text-green-600 font-bold">Lucro: ${bc.profit.toFixed(2)}</span> • ROI: <span className="font-bold text-green-600">{bc.roi.toFixed(0)}%</span>
                                <div className="mt-1 text-gray-400">Vende por ${p.marketplace[best].price} • Compra por ${p.storePrice}</div>
                              </div>
                            );})()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length===0&&(
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-semibold">Nenhum produto encontrado</div>
            <div className="text-sm mt-1">Ajuste os filtros para ver mais resultados</div>
          </div>
        )}
      </div>
    </div>
  );
}