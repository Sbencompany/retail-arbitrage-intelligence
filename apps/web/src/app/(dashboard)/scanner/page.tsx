'use client';
import { useState, useMemo } from 'react';

const FEES = {
  amazon:  { pct: 0.15,  perOrder: 0,    name: 'Amazon',      icon: '🟠', tag: '15%+FBA+frete' },
  ebay:    { pct: 0.136, perOrder: 0.40, name: 'eBay',        icon: '🔴', tag: '13.6%+$0.40' },
  walmart: { pct: 0.08,  perOrder: 0,    name: 'Walmart Mkt', icon: '🔵', tag: '8% referral' },
} as const;

type MktKey = keyof typeof FEES;

function fbaFee(w: number) {
  if (w <= 1) return 3.22; if (w <= 2) return 3.40; if (w <= 3) return 4.01;
  if (w <= 5) return 4.85; if (w <= 10) return 5.69; if (w <= 20) return 7.79;
  return 10.45;
}
function shipFee(w: number) {
  if (w <= 1) return 4.50; if (w <= 5) return 7.00;
  if (w <= 10) return 11.00; if (w <= 20) return 16.00; return 22.00;
}
function calc(buy: number, sell: number, mk: MktKey, w: number) {
  const f = FEES[mk];
  let fees = sell * f.pct + f.perOrder;
  if (mk === 'amazon') fees += fbaFee(w) + shipFee(w);
  const profit = sell - buy - fees;
  return { fees, profit, roi: (profit / buy) * 100 };
}
function bestMkt(p: typeof PRODUCTS[0]): MktKey {
  const keys: MktKey[] = ['amazon','ebay','walmart'];
  return keys.reduce((b,k) => calc(p.storePrice,p.marketplace[k].price,k,p.weightLbs).roi > calc(p.storePrice,p.marketplace[b].price,b,p.weightLbs).roi ? k : b, keys[0]);
}const PRODUCTS = [
  { id:1, rank:1,
    name:'PowerXL Vortex Pro Air Fryer 8qt',
    brand:'PowerXL', upc:'027043003874', category:'Kitchen', weightLbs:11.5,
    monthlySold:8500, store:'Target', storePrice:59.99, origPrice:119.99, discount:50,
    storeUrl:'https://www.target.com/p/powerxl-8qt-air-fryer/-/A-94740722',
    mapUrl:'https://www.google.com/maps/search/Target+near+me',
    img:'https://target.scene7.com/is/image/Target/GUEST_c8ee953b-9466-44f3-83ee-fcaffe948466?wid=300&hei=300&qlt=80',
    availability:847, badge:'Bestseller',
    marketplace:{
      amazon:  { price:188.99, url:'https://www.amazon.com/dp/B0GGRXQ432',       img:'https://m.media-amazon.com/images/I/617lzHhtCEL._AC_SX300_SY300_.jpg' },
      ebay:    { price:165.00, url:'https://www.ebay.com/sch/i.html?_nkw=PowerXL+Vortex+Pro+8qt+027043003874', img:'https://m.media-amazon.com/images/I/617lzHhtCEL._AC_SX300_SY300_.jpg' },
      walmart: { price:149.99, url:'https://www.walmart.com/search?q=PowerXL+Vortex+Pro+8qt+Air+Fryer',        img:'https://m.media-amazon.com/images/I/617lzHhtCEL._AC_SX300_SY300_.jpg' },
    }
  },
  { id:2, rank:2,
    name:'Instant Pot Rio 4qt Mini Multi-Cooker',
    brand:'Instant Pot', upc:'810028584124', category:'Kitchen', weightLbs:7.2,
    monthlySold:6200, store:'Target', storePrice:49.99, origPrice:99.99, discount:50,
    storeUrl:'https://www.target.com/p/instant-pot-4qt-rio-mini/-/A-94646749',
    mapUrl:'https://www.google.com/maps/search/Target+near+me',
    img:'https://target.scene7.com/is/image/Target/GUEST_d3317263-7a1c-46e4-9067-8cadaac508b7?wid=300&hei=300&qlt=80',
    availability:512, badge:'Bestseller',
    marketplace:{
      amazon:  { price:89.99, url:'https://www.amazon.com/dp/B0F9B923NC',  img:'https://m.media-amazon.com/images/I/71gkCf-Lo8L._AC_SX300_SY300_.jpg' },
      ebay:    { price:79.00, url:'https://www.ebay.com/sch/i.html?_nkw=Instant+Pot+Rio+4qt+810028584124', img:'https://m.media-amazon.com/images/I/71gkCf-Lo8L._AC_SX300_SY300_.jpg' },
      walmart: { price:74.99, url:'https://www.walmart.com/search?q=Instant+Pot+Rio+4qt+mini',              img:'https://m.media-amazon.com/images/I/71gkCf-Lo8L._AC_SX300_SY300_.jpg' },
    }
  },
  { id:3, rank:3,
    name:'Ninja Crispi Pro AS101CY Air Fryer',
    brand:'Ninja', upc:'622356594806', category:'Kitchen', weightLbs:9.8,
    monthlySold:5800, store:'Best Buy', storePrice:249.99, origPrice:299.99, discount:17,
    storeUrl:'https://www.bestbuy.com/site/ninja-crispi-pro-4-in-1-air-fry-system/6650389.p',
    mapUrl:'https://www.google.com/maps/search/Best+Buy+near+me',
    img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6650/6650389_sd.jpg',
    availability:623, badge:'Top Seller',
    marketplace:{
      amazon:  { price:289.99, url:'https://www.amazon.com/s?k=Ninja+Crispi+Pro+AS101+622356594806', img:'https://m.media-amazon.com/images/I/71YLKrqD1DL._AC_SX300_SY300_.jpg' },
      ebay:    { price:265.00, url:'https://www.ebay.com/sch/i.html?_nkw=Ninja+Crispi+Pro+AS101+622356594806', img:'https://m.media-amazon.com/images/I/71YLKrqD1DL._AC_SX300_SY300_.jpg' },
      walmart: { price:279.99, url:'https://www.walmart.com/search?q=Ninja+Crispi+Pro+AS101', img:'https://m.media-amazon.com/images/I/71YLKrqD1DL._AC_SX300_SY300_.jpg' },
    }
  },
  { id:4, rank:4,
    name:'DEWALT 20V MAX Drill + Impact Combo DCK240C2',
    brand:'DEWALT', upc:'885911417815', category:'Tools', weightLbs:8.5,
    monthlySold:4900, store:'Home Depot', storePrice:99.00, origPrice:169.00, discount:41,
    storeUrl:'https://www.homedepot.com/p/DEWALT-20V-MAX-Cordless-Drill-Driver-Impact-Driver-Combo-Kit-DCK240C2/202591940',
    mapUrl:'https://www.google.com/maps/search/Home+Depot+near+me',
    img:'https://images.thdstatic.com/productImages/bf9fc3cc-8a68-4a90-8611-d1c028c0f6e2/svn/dewalt-power-tool-combo-kits-dck240c2-64_600.jpg',
    availability:398, badge:'Pro Choice',
    marketplace:{
      amazon:  { price:169.00, url:'https://www.amazon.com/dp/B00DDXML7C', img:'https://m.media-amazon.com/images/I/71BKAZ-7S0L._AC_SX300_SY300_.jpg' },
      ebay:    { price:155.00, url:'https://www.ebay.com/sch/i.html?_nkw=DEWALT+DCK240C2+885911417815', img:'https://m.media-amazon.com/images/I/71BKAZ-7S0L._AC_SX300_SY300_.jpg' },
      walmart: { price:159.00, url:'https://www.walmart.com/search?q=DEWALT+DCK240C2+combo+kit', img:'https://m.media-amazon.com/images/I/71BKAZ-7S0L._AC_SX300_SY300_.jpg' },
    }
  },
  { id:5, rank:5,
    name:'Oral-B iO Series 4 Electric Toothbrush',
    brand:'Oral-B', upc:'069055134979', category:'Health', weightLbs:1.8,
    monthlySold:4200, store:'Walgreens', storePrice:39.99, origPrice:79.99, discount:50,
    storeUrl:'https://www.walgreens.com/store/c/oral-b-io-series-4-electric-toothbrush/ID=prod6569782-product',
    mapUrl:'https://www.google.com/maps/search/Walgreens+near+me',
    img:'https://m.media-amazon.com/images/I/61HG6e2lG4L._AC_SX300_SY300_.jpg',
    availability:1204, badge:'Flash Sale',
    marketplace:{
      amazon:  { price:79.97, url:'https://www.amazon.com/dp/B08J4HMHTQ', img:'https://m.media-amazon.com/images/I/61HG6e2lG4L._AC_SX300_SY300_.jpg' },
      ebay:    { price:69.00, url:'https://www.ebay.com/sch/i.html?_nkw=Oral-B+iO+Series+4+069055134979', img:'https://m.media-amazon.com/images/I/61HG6e2lG4L._AC_SX300_SY300_.jpg' },
      walmart: { price:74.99, url:'https://www.walmart.com/search?q=Oral-B+iO+Series+4+electric+toothbrush', img:'https://m.media-amazon.com/images/I/61HG6e2lG4L._AC_SX300_SY300_.jpg' },
    }
  },
  { id:6, rank:6,
    name:'Philips Sonicare ProtectiveClean 4100 HX6817',
    brand:'Philips', upc:'075020065148', category:'Health', weightLbs:1.5,
    monthlySold:3800, store:'Costco', storePrice:44.99, origPrice:79.99, discount:44,
    storeUrl:'https://www.costco.com/catalogsearch/results?query=philips+sonicare+hx6817',
    mapUrl:'https://www.google.com/maps/search/Costco+near+me',
    img:'https://m.media-amazon.com/images/I/61nVmrI0YXL._AC_SX300_SY300_.jpg',
    availability:560, badge:'Member Deal',
    marketplace:{
      amazon:  { price:79.96, url:'https://www.amazon.com/dp/B078GVDB19', img:'https://m.media-amazon.com/images/I/61nVmrI0YXL._AC_SX300_SY300_.jpg' },
      ebay:    { price:69.99, url:'https://www.ebay.com/sch/i.html?_nkw=Philips+Sonicare+HX6817+075020065148', img:'https://m.media-amazon.com/images/I/61nVmrI0YXL._AC_SX300_SY300_.jpg' },
      walmart: { price:74.99, url:'https://www.walmart.com/search?q=Philips+Sonicare+ProtectiveClean+4100', img:'https://m.media-amazon.com/images/I/61nVmrI0YXL._AC_SX300_SY300_.jpg' },
    }
  },
  { id:7, rank:7,
    name:'KitchenAid 5-Speed Hand Mixer KHM512',
    brand:'KitchenAid', upc:'883049274941', category:'Kitchen', weightLbs:3.2,
    monthlySold:3200, store:"Kohl's", storePrice:39.99, origPrice:69.99, discount:43,
    storeUrl:"https://www.kohls.com/catalog/search.jsp?search=KitchenAid+KHM512",
    mapUrl:"https://www.google.com/maps/search/Kohl's+near+me",
    img:'https://m.media-amazon.com/images/I/61gbWkQPUhL._AC_SX300_SY300_.jpg',
    availability:445, badge:'Clearance',
    marketplace:{
      amazon:  { price:69.99, url:'https://www.amazon.com/dp/B0000CFDVU', img:'https://m.media-amazon.com/images/I/61gbWkQPUhL._AC_SX300_SY300_.jpg' },
      ebay:    { price:59.00, url:'https://www.ebay.com/sch/i.html?_nkw=KitchenAid+KHM512+883049274941', img:'https://m.media-amazon.com/images/I/61gbWkQPUhL._AC_SX300_SY300_.jpg' },
      walmart: { price:64.99, url:'https://www.walmart.com/search?q=KitchenAid+hand+mixer+KHM512', img:'https://m.media-amazon.com/images/I/61gbWkQPUhL._AC_SX300_SY300_.jpg' },
    }
  },
  { id:8, rank:8,
    name:'Shark Navigator Lift-Away NV352 Vacuum',
    brand:'Shark', upc:'622356543842', category:'Home', weightLbs:12.5,
    monthlySold:2900, store:"Sam's Club", storePrice:89.99, origPrice:159.99, discount:44,
    storeUrl:"https://www.samsclub.com/search?searchTerm=Shark+Navigator+NV352",
    mapUrl:"https://www.google.com/maps/search/Sam's+Club+near+me",
    img:'https://m.media-amazon.com/images/I/81h-gPBFWRL._AC_SX300_SY300_.jpg',
    availability:312, badge:'Member Savings',
    marketplace:{
      amazon:  { price:159.99, url:'https://www.amazon.com/dp/B006DXCAPW', img:'https://m.media-amazon.com/images/I/81h-gPBFWRL._AC_SX300_SY300_.jpg' },
      ebay:    { price:140.00, url:'https://www.ebay.com/sch/i.html?_nkw=Shark+Navigator+NV352+622356543842', img:'https://m.media-amazon.com/images/I/81h-gPBFWRL._AC_SX300_SY300_.jpg' },
      walmart: { price:149.99, url:'https://www.walmart.com/search?q=Shark+Navigator+Lift-Away+NV352', img:'https://m.media-amazon.com/images/I/81h-gPBFWRL._AC_SX300_SY300_.jpg' },
    }
  },
  { id:9, rank:9,
    name:'Dyson V8 Cordless Vacuum SV10',
    brand:'Dyson', upc:'885609014948', category:'Home', weightLbs:5.6,
    monthlySold:2600, store:'Best Buy', storePrice:199.99, origPrice:349.99, discount:43,
    storeUrl:'https://www.bestbuy.com/site/searchpage.jsp?st=Dyson+V8+cordless',
    mapUrl:'https://www.google.com/maps/search/Best+Buy+near+me',
    img:'https://m.media-amazon.com/images/I/41gWVCfxqkL._AC_SX300_SY300_.jpg',
    availability:289, badge:'Deal of Day',
    marketplace:{
      amazon:  { price:349.00, url:'https://www.amazon.com/dp/B014R57P7G', img:'https://m.media-amazon.com/images/I/41gWVCfxqkL._AC_SX300_SY300_.jpg' },
      ebay:    { price:299.00, url:'https://www.ebay.com/sch/i.html?_nkw=Dyson+V8+SV10+885609014948', img:'https://m.media-amazon.com/images/I/41gWVCfxqkL._AC_SX300_SY300_.jpg' },
      walmart: { price:319.99, url:'https://www.walmart.com/search?q=Dyson+V8+cordless+vacuum', img:'https://m.media-amazon.com/images/I/41gWVCfxqkL._AC_SX300_SY300_.jpg' },
    }
  },
  { id:10, rank:10,
    name:'Lodge Cast Iron Skillet 12-inch L10SK3',
    brand:'Lodge', upc:'079035061012', category:'Kitchen', weightLbs:8.0,
    monthlySold:2400, store:'TJ Maxx', storePrice:19.99, origPrice:49.99, discount:60,
    storeUrl:'https://www.tjmaxx.tjx.com/store/browse/search.jsp?searchKey=Lodge+cast+iron+12',
    mapUrl:'https://www.google.com/maps/search/TJ+Maxx+near+me',
    img:'https://m.media-amazon.com/images/I/91fhHidBLrL._AC_SX300_SY300_.jpg',
    availability:678, badge:'Deep Discount',
    marketplace:{
      amazon:  { price:49.90, url:'https://www.amazon.com/dp/B00006JSUA', img:'https://m.media-amazon.com/images/I/91fhHidBLrL._AC_SX300_SY300_.jpg' },
      ebay:    { price:42.00, url:'https://www.ebay.com/sch/i.html?_nkw=Lodge+L10SK3+cast+iron+079035061012', img:'https://m.media-amazon.com/images/I/91fhHidBLrL._AC_SX300_SY300_.jpg' },
      walmart: { price:44.99, url:'https://www.walmart.com/search?q=Lodge+cast+iron+12+inch', img:'https://m.media-amazon.com/images/I/91fhHidBLrL._AC_SX300_SY300_.jpg' },
    }
  },
  { id:11, rank:11,
    name:'Ozark Trail 40oz Insulated Tumbler',
    brand:'Ozark Trail', upc:'191554046023', category:'Outdoors', weightLbs:1.2,
    monthlySold:2100, store:'Marshalls', storePrice:9.99, origPrice:24.99, discount:60,
    storeUrl:'https://www.marshalls.com/us/store/browse/search.jsp?searchKey=insulated+tumbler+40oz',
    mapUrl:'https://www.google.com/maps/search/Marshalls+near+me',
    img:'https://m.media-amazon.com/images/I/71dVEDIAcgL._AC_SX300_SY300_.jpg',
    availability:921, badge:'Hot Deal',
    marketplace:{
      amazon:  { price:24.99, url:'https://www.amazon.com/s?k=stainless+tumbler+40oz+insulated', img:'https://m.media-amazon.com/images/I/71dVEDIAcgL._AC_SX300_SY300_.jpg' },
      ebay:    { price:21.00, url:'https://www.ebay.com/sch/i.html?_nkw=stainless+tumbler+40oz+insulated', img:'https://m.media-amazon.com/images/I/71dVEDIAcgL._AC_SX300_SY300_.jpg' },
      walmart: { price:22.99, url:'https://www.walmart.com/search?q=Ozark+Trail+40oz+tumbler', img:'https://m.media-amazon.com/images/I/71dVEDIAcgL._AC_SX300_SY300_.jpg' },
    }
  },
  { id:12, rank:12,
    name:'Werner 6ft Fiberglass Step Ladder FS106',
    brand:'Werner', upc:'783222006027', category:'Tools', weightLbs:22.0,
    monthlySold:1800, store:'Ace Hardware', storePrice:69.99, origPrice:129.99, discount:46,
    storeUrl:'https://www.acehardware.com/departments/tools/ladders/step-ladders',
    mapUrl:'https://www.google.com/maps/search/Ace+Hardware+near+me',
    img:'https://m.media-amazon.com/images/I/71YwJsJQhHL._AC_SX300_SY300_.jpg',
    availability:234, badge:'Sale',
    marketplace:{
      amazon:  { price:119.99, url:'https://www.amazon.com/dp/B001DCGVZW', img:'https://m.media-amazon.com/images/I/71YwJsJQhHL._AC_SX300_SY300_.jpg' },
      ebay:    { price:105.00, url:'https://www.ebay.com/sch/i.html?_nkw=Werner+FS106+fiberglass+ladder+783222006027', img:'https://m.media-amazon.com/images/I/71YwJsJQhHL._AC_SX300_SY300_.jpg' },
      walmart: { price:109.99, url:'https://www.walmart.com/search?q=Werner+6ft+fiberglass+ladder', img:'https://m.media-amazon.com/images/I/71YwJsJQhHL._AC_SX300_SY300_.jpg' },
    }
  },
] as const;

const CATEGORIES = ['Todos','Kitchen','Tools','Health','Home','Outdoors'];
const STORES = ['Todas','Target','Best Buy','Costco',"Kohl's",'Home Depot','Walgreens',"Sam's Club","TJ Maxx",'Marshalls','Ace Hardware'];

const BADGE: Record<string,{bg:string;tx:string}> = {
  Bestseller:    {bg:'bg-emerald-500',   tx:'text-white'},
  'Top Seller':  {bg:'bg-blue-600',      tx:'text-white'},
  'Flash Sale':  {bg:'bg-red-500',       tx:'text-white'},
  'Deal of Day': {bg:'bg-purple-600',    tx:'text-white'},
  Clearance:     {bg:'bg-orange-500',    tx:'text-white'},
  'Hot Deal':    {bg:'bg-pink-500',      tx:'text-white'},
  'Deep Discount':{bg:'bg-yellow-500',   tx:'text-gray-900'},
  'Member Deal': {bg:'bg-teal-600',      tx:'text-white'},
  'Member Savings':{bg:'bg-teal-600',    tx:'text-white'},
  'Pro Choice':  {bg:'bg-gray-700',      tx:'text-white'},
  Sale:          {bg:'bg-indigo-500',    tx:'text-white'},
};

function Img({src,alt,cls}:{src:string;alt:string;cls:string}) {
  const [e,setE] = useState(false);
  if(e) return <div className={cls+' bg-slate-700 flex items-center justify-center rounded-xl'}><span className="text-xl">🖼️</span></div>;
  return <img src={src} alt={alt} onError={()=>setE(true)} className={cls+' object-contain'}/>;
}

export default function ScannerPage() {
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('Todos');
  const [store, setStore]       = useState('Todas');
  const [minDisc, setMinDisc]   = useState(0);
  const [minROI, setMinROI]     = useState(0);
  const [mkt, setMkt]           = useState<MktKey>('amazon');
  const [expanded, setExpanded] = useState<number|null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return PRODUCTS.filter(p => {
      if (q && !p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q) && !p.upc.includes(q) && !p.store.toLowerCase().includes(q)) return false;
      if (category !== 'Todos' && p.category !== category) return false;
      if (store !== 'Todas' && p.store !== store) return false;
      if (p.discount < minDisc) return false;
      const b = bestMkt(p);
      if (calc(p.storePrice, p.marketplace[b].price, b, p.weightLbs).roi < minROI) return false;
      return true;
    });
  }, [search, category, store, minDisc, minROI]);

  const handleScan = () => {
    setScanning(true); setProgress(0);
    const iv = setInterval(() => setProgress(v => {
      if (v >= 100) { clearInterval(iv); setScanning(false); return 100; }
      return v + 3;
    }), 60);
  };

  const avgROI = filtered.length ? Math.round(filtered.reduce((s,p)=>{const b=bestMkt(p);return s+calc(p.storePrice,p.marketplace[b].price,b,p.weightLbs).roi;},0)/filtered.length) : 0;
  const profitable = filtered.filter(p=>{const b=bestMkt(p);return calc(p.storePrice,p.marketplace[b].price,b,p.weightLbs).profit>0;}).length;

  const mkBorder = {amazon:'border-orange-500/50 bg-orange-900/20',ebay:'border-red-500/50 bg-red-900/20',walmart:'border-blue-500/50 bg-blue-900/20'};
  const mkBtn    = {amazon:'bg-orange-600 hover:bg-orange-500',ebay:'bg-red-600 hover:bg-red-500',walmart:'bg-blue-600 hover:bg-blue-500'};
  const mkBadge  = {amazon:'bg-orange-500/20 border-orange-500/40 text-orange-300',ebay:'bg-red-500/20 border-red-500/40 text-red-300',walmart:'bg-blue-500/20 border-blue-500/40 text-blue-300'};
  const mkActive = {amazon:'bg-orange-500/20 border-orange-400 text-orange-300',ebay:'bg-red-500/20 border-red-400 text-red-300',walmart:'bg-blue-500/20 border-blue-400 text-blue-300'};

  return (
    <div className="min-h-screen bg-slate-900">
      {/* HERO */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">📡</span>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Scanner de Deals</h1>
                <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-extrabold rounded-full tracking-wide">LOJAS FÍSICAS</span>
              </div>
              <p className="text-slate-400 text-sm">Compre barato em lojas físicas · Venda com lucro nos marketplaces · Comparação pelo <span className="text-blue-400 font-semibold">mesmo UPC</span></p>
            </div>
            <button onClick={handleScan} disabled={scanning}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all">
              {scanning ? '⏳' : '🔍'} {scanning ? 'Escaneando ' + progress + '%' : 'Escanear Agora'}
            </button>
          </div>
          {scanning && <div className="w-full bg-slate-700 rounded-full h-1.5 mb-4"><div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1.5 rounded-full transition-all" style={{width:progress+'%'}}/></div>}
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {icon:'📦',label:'Produtos',val:filtered.length,suf:'',c:'text-blue-400'},
              {icon:'✅',label:'Com Lucro',val:profitable,suf:'',c:'text-emerald-400'},
              {icon:'📈',label:'ROI Médio',val:avgROI,suf:'%',c:'text-yellow-400'},
              {icon:'🏪',label:'Lojas',val:STORES.length-1,suf:'',c:'text-purple-400'},
            ].map(k=>(
              <div key={k.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-xl">{k.icon}</span>
                <div><div className={'text-xl font-extrabold '+k.c}>{k.val}{k.suf}</div><div className="text-xs text-slate-400">{k.label}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-5">
        {/* FILTERS */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-3">
            <div className="lg:col-span-2 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
              <input type="text" placeholder="Produto, marca ou UPC..." value={search} onChange={e=>setSearch(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">🏷️</span>
              <select value={category} onChange={e=>setCategory(e.target.value)}
                className="w-full appearance-none bg-slate-700 border border-slate-600 text-white rounded-xl pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                {CATEGORIES.map(c=><option key={c} value={c} className="bg-slate-800">{c}</option>)}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">🏪</span>
              <select value={store} onChange={e=>setStore(e.target.value)}
                className="w-full appearance-none bg-slate-700 border border-slate-600 text-white rounded-xl pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                {STORES.map(s=><option key={s} value={s} className="bg-slate-800">{s}</option>)}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">🏷</span>
              <input type="number" min={0} max={90} placeholder="Desc % ≥" value={minDisc||''} onChange={e=>setMinDisc(Number(e.target.value)||0)}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">📊</span>
              <input type="number" min={0} max={500} placeholder="ROI % ≥" value={minROI||''} onChange={e=>setMinROI(Number(e.target.value)||0)}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[['⭐ ROI 50%+',()=>setMinROI(50)],['🏷️ Desc 40%+',()=>setMinDisc(40)],['🍳 Kitchen',()=>setCategory('Kitchen')],['🔧 Tools',()=>setCategory('Tools')],['💊 Health',()=>setCategory('Health')],['🏠 Home',()=>setCategory('Home')],['🔄 Limpar',()=>{setSearch('');setCategory('Todos');setStore('Todas');setMinDisc(0);setMinROI(0);}]].map(([l,fn])=>(
              <button key={String(l)} onClick={fn as ()=>void} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 hover:text-white text-xs rounded-lg transition-all font-medium">{String(l)}</button>
            ))}
          </div>
        </div>

        {/* MKT TOGGLE */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-slate-400 text-sm font-medium">Ver preços em:</span>
          {(['amazon','ebay','walmart'] as MktKey[]).map(m=>(
            <button key={m} onClick={()=>setMkt(m)}
              className={'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ' + (mkt===m ? mkActive[m] : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500')}>
              {FEES[m].icon} {FEES[m].name}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-slate-400 text-sm">{filtered.length} de {PRODUCTS.length} produtos</span>
          </div>
        </div>
        {/* PRODUCT CARDS */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-20 bg-slate-800/40 rounded-2xl border border-slate-700/50">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-white font-bold text-lg">Nenhum produto encontrado</p>
              <p className="text-slate-400 text-sm mt-1">Tente ajustar os filtros</p>
            </div>
          )}
          {filtered.map(p => {
            const mc  = calc(p.storePrice, p.marketplace[mkt].price, mkt, p.weightLbs);
            const bk  = bestMkt(p);
            const isE = expanded === p.id;
            const bdg = BADGE[p.badge] ?? {bg:'bg-slate-600',tx:'text-white'};
            return (
              <div key={p.id} className={'rounded-2xl border overflow-hidden transition-all ' + (isE ? 'border-blue-500/50 shadow-xl shadow-blue-900/20' : 'border-slate-700/50 hover:border-slate-600/70')} style={{background: isE ? 'rgba(15,23,42,0.98)' : 'rgba(30,41,59,0.80)'}}>
                {/* ROW */}
                <div className="p-4 cursor-pointer select-none" onClick={()=>setExpanded(isE?null:p.id)}>
                  <div className="flex gap-4 items-center">
                    <div className="relative flex-shrink-0">
                      <div className="absolute -top-1 -left-1 z-10 w-6 h-6 bg-blue-600 text-white text-xs font-extrabold rounded-full flex items-center justify-center shadow">{p.rank}</div>
                      <div className="w-[72px] h-[72px] rounded-xl overflow-hidden border border-slate-600 bg-slate-800 flex items-center justify-center">
                        <Img src={p.img} alt={p.name} cls="w-[72px] h-[72px] rounded-xl"/>
                      </div>
                      <div className="text-center mt-1 text-xs text-slate-400 font-medium">{p.store}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className={'px-2 py-0.5 rounded-lg text-xs font-extrabold ' + bdg.bg + ' ' + bdg.tx}>{p.badge}</span>
                        <code className="text-xs text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-lg font-mono">UPC: {p.upc}</code>
                        {bk===mkt && <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-bold rounded-lg">⭐ Melhor Mkt</span>}
                      </div>
                      <h3 className="font-bold text-white text-sm leading-snug">{p.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs">
                        <span className="text-slate-300">🏷️ <strong className="text-emerald-400">${p.storePrice}</strong> <span className="line-through text-slate-500">${p.origPrice}</span> <span className="text-red-400 font-bold">-{p.discount}%</span></span>
                        <span className="text-slate-300">{FEES[mkt].icon} <strong className="text-blue-300">${p.marketplace[mkt].price}</strong></span>
                        <span className="text-slate-500">📊 {p.monthlySold.toLocaleString()}/mês</span>
                        <span className="text-slate-500">📦 {p.availability} unid.</span>
                      </div>
                    </div>
                    <div className={'flex-shrink-0 text-right px-4 py-3 rounded-xl border ' + (mc.profit>0 ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30')}>
                      <div className={'text-xl font-extrabold ' + (mc.profit>0?'text-emerald-400':'text-red-400')}>{mc.profit>=0?'+':''}${mc.profit.toFixed(2)}</div>
                      <div className={'text-sm font-bold ' + (mc.roi>0?'text-emerald-300':'text-red-400')}>ROI {mc.roi.toFixed(0)}%</div>
                      <div className="text-xs text-slate-500 mt-0.5">{isE?'▲ fechar':'▼ detalhes'}</div>
                    </div>
                  </div>
                </div>

                {/* EXPANDED */}
                {isE && (
                  <div className="border-t border-slate-700/50 bg-slate-900/60 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-slate-400 text-sm">🔍 Comparando mesmo UPC:</span>
                      <code className="bg-blue-900/30 border border-blue-700/40 text-blue-300 text-sm font-mono px-3 py-0.5 rounded-lg">{p.upc}</code>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                      {/* LEFT: buy + sell */}
                      <div className="xl:col-span-3 space-y-3">
                        {/* BUY */}
                        <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-950/20 p-3">
                          <div className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest mb-2">🛒 Comprar em {p.store}</div>
                          <div className="flex gap-3 items-center">
                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-emerald-700/30 bg-slate-800 flex-shrink-0 flex items-center justify-center">
                              <Img src={p.img} alt={p.name} cls="w-16 h-16 rounded-xl"/>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-extrabold text-emerald-400">${p.storePrice}</span>
                                <span className="text-sm text-slate-500 line-through">${p.origPrice}</span>
                                <span className="text-sm text-red-400 font-bold">-{p.discount}%</span>
                              </div>
                              <div className="text-xs text-slate-400">{p.upc} · {p.weightLbs} lbs</div>
                            </div>
                            <a href={p.storeUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition whitespace-nowrap">Ver Produto →</a>
                          </div>
                        </div>
                        {/* SELL */}
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Vender em:</p>
                        {(['amazon','ebay','walmart'] as MktKey[]).map(mk=>{
                          const mc2 = calc(p.storePrice, p.marketplace[mk].price, mk, p.weightLbs);
                          const ib  = bk===mk;
                          return (
                            <div key={mk} className={'rounded-xl border-2 p-3 ' + (ib ? mkBorder[mk] : 'border-slate-700/40 bg-slate-800/30')}>
                              <div className="flex items-start gap-3">
                                <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 flex-shrink-0 flex items-center justify-center">
                                  <Img src={p.marketplace[mk].img} alt={p.name+' '+mk} cls="w-14 h-14 rounded-xl"/>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-extrabold text-white">{FEES[mk].icon} {FEES[mk].name}</span>
                                      {ib && <span className={'text-xs font-bold px-1.5 py-0.5 rounded border ' + mkBadge[mk]}>⭐ Melhor</span>}
                                    </div>
                                    <span className="text-base font-extrabold text-white">${p.marketplace[mk].price}</span>
                                  </div>
                                  <div className="grid grid-cols-4 gap-1.5 text-xs mb-2">
                                    {[['Custo','$'+p.storePrice,'text-slate-300','bg-slate-800/80'],['Taxas','$'+mc2.fees.toFixed(2),'text-red-300','bg-slate-800/80'],['Lucro',(mc2.profit>=0?'+':'')+'$'+mc2.profit.toFixed(2),mc2.profit>0?'text-emerald-400':'text-red-400',mc2.profit>0?'bg-emerald-900/30':'bg-red-900/30'],['ROI',mc2.roi.toFixed(0)+'%',mc2.roi>0?'text-emerald-400':'text-red-400',mc2.roi>0?'bg-emerald-900/30':'bg-red-900/30']].map(([lbl,val,vc,bg])=>(
                                      <div key={String(lbl)} className={'rounded-lg p-1.5 text-center '+String(bg)}>
                                        <div className="text-slate-500 text-xs">{lbl}</div>
                                        <div className={'font-extrabold text-xs '+String(vc)}>{val}</div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="text-xs text-slate-500">{FEES[mk].tag}{mk==='amazon'?' + FBA($'+fbaFee(p.weightLbs).toFixed(2)+')+frete':''}</div>
                                </div>
                              </div>
                              <a href={p.marketplace[mk].url} target="_blank" rel="noopener noreferrer"
                                className={'mt-2.5 flex items-center justify-center w-full py-2 text-white text-xs font-bold rounded-xl transition ' + mkBtn[mk]}>
                                Ver em {FEES[mk].name} →
                              </a>
                            </div>
                          );
                        })}
                      </div>
                      {/* RIGHT: best + map */}
                      <div className="xl:col-span-2 flex flex-col gap-3">
                        <div className="rounded-xl border border-yellow-500/30 bg-yellow-900/10 p-4">
                          <div className="text-xs font-extrabold text-yellow-400 uppercase tracking-widest mb-2">⭐ Melhor Opção</div>
                          <div className="text-lg font-extrabold text-white mb-3">{FEES[bk].icon} {FEES[bk].name}</div>
                          {(()=>{ const bc=calc(p.storePrice,p.marketplace[bk].price,bk,p.weightLbs); return (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm">Lucro líquido</span>
                                <span className="text-emerald-400 font-extrabold text-lg">+${bc.profit.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm">ROI</span>
                                <span className="text-emerald-400 font-extrabold text-lg">{bc.roi.toFixed(0)}%</span>
                              </div>
                              <div className="border-t border-slate-700/50 pt-2 flex justify-between text-xs text-slate-500">
                                <span>Compra ${p.storePrice}</span>
                                <span>Vende ${p.marketplace[bk].price}</span>
                              </div>
                            </div>
                          );})()}
                        </div>
                        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-3 flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-bold text-white text-sm">{p.store}</div>
                              <div className="text-xs text-slate-400">{p.availability} unidades</div>
                            </div>
                            <a href={p.mapUrl} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition">📍 Mapa</a>
                          </div>
                          <iframe src={'https://maps.google.com/maps?q='+encodeURIComponent(p.store+' near me')+'&output=embed'} className="w-full rounded-xl" height="200" style={{border:0}} loading="lazy"/>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}