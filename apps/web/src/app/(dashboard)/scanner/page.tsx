'use client';
import { useState, useMemo } from 'react';

const AMZ_FEE = 0.15;
const EBAY_FEE = 0.136;
const EBAY_ORD = 0.40;
const WM_FEE = 0.08;

function fbaFee(w: number): number {
  if (w <= 1) return 3.22;
  if (w <= 2) return 3.40;
  if (w <= 3) return 4.01;
  if (w <= 5) return 4.85;
  if (w <= 10) return 5.69;
  if (w <= 20) return 7.79;
  return 10.45;
}
function shipFee(w: number): number {
  if (w <= 1) return 4.50;
  if (w <= 5) return 7.00;
  if (w <= 10) return 11.00;
  if (w <= 20) return 16.00;
  return 22.00;
}
function calcAmz(buy: number, sell: number, w: number) {
  const fees = sell * AMZ_FEE + fbaFee(w) + shipFee(w);
  return { fees, profit: sell - buy - fees, roi: ((sell - buy - fees) / buy) * 100 };
}
function calcEbay(buy: number, sell: number) {
  const fees = sell * EBAY_FEE + EBAY_ORD;
  return { fees, profit: sell - buy - fees, roi: ((sell - buy - fees) / buy) * 100 };
}
function calcWm(buy: number, sell: number) {
  const fees = sell * WM_FEE;
  return { fees, profit: sell - buy - fees, roi: ((sell - buy - fees) / buy) * 100 };
}
function calcAll(buy: number, a: number, e: number, w: number, wt: number) {
  return { amazon: calcAmz(buy, a, wt), ebay: calcEbay(buy, e), walmart: calcWm(buy, w) };
}
function bestOf(buy: number, a: number, e: number, w: number, wt: number): string {
  const ra = calcAmz(buy, a, wt).roi;
  const re = calcEbay(buy, e).roi;
  const rw = calcWm(buy, w).roi;
  if (ra >= re && ra >= rw) return 'amazon';
  if (re >= ra && re >= rw) return 'ebay';
  return 'walmart';
}

const PRODUCTS = [
  { id:1, rank:1, name:'PowerXL Vortex Pro Air Fryer 8qt Black', brand:'PowerXL',
    upc:'027043003874', category:'Kitchen', weight:11.5, monthly:8500,
    store:'Target', buy:59.99, orig:119.99, disc:50, avail:847, badge:'Bestseller',
    storeUrl:'https://www.target.com/p/powerxl-8qt-air-fryer/-/A-94740722',
    mapUrl:'https://www.google.com/maps/search/Target+near+me',
    img:'https://target.scene7.com/is/image/Target/GUEST_c8ee953b-9466-44f3-83ee-fcaffe948466?wid=300&hei=300&qlt=80',
    amz:{ price:188.99, url:'https://www.amazon.com/dp/B0GGRXQ432', img:'https://target.scene7.com/is/image/Target/GUEST_c8ee953b-9466-44f3-83ee-fcaffe948466?wid=200&hei=200&qlt=80'},
    ebay:{ price:165.00, url:'https://www.ebay.com/sch/i.html?_nkw=PowerXL+Vortex+Pro+8qt+027043003874', img:'https://target.scene7.com/is/image/Target/GUEST_c8ee953b-9466-44f3-83ee-fcaffe948466?wid=200&hei=200&qlt=80'},
    wm:{ price:149.99, url:'https://www.walmart.com/search?q=PowerXL+Vortex+Pro+8qt+air+fryer', img:'https://target.scene7.com/is/image/Target/GUEST_c8ee953b-9466-44f3-83ee-fcaffe948466?wid=200&hei=200&qlt=80'},
  },
  { id:2, rank:2, name:'Instant Pot Rio 4qt Mini Multi-Cooker', brand:'Instant Pot',
    upc:'810028584124', category:'Kitchen', weight:7.2, monthly:6200,
    store:'Target', buy:49.99, orig:99.99, disc:50, avail:512, badge:'Bestseller',
    storeUrl:'https://www.target.com/p/instant-pot-4qt-rio-mini/-/A-94646749',
    mapUrl:'https://www.google.com/maps/search/Target+near+me',
    img:'https://target.scene7.com/is/image/Target/GUEST_d3317263-7a1c-46e4-9067-8cadaac508b7?wid=300&hei=300&qlt=80',
    amz:{ price:89.99, url:'https://www.amazon.com/dp/B0F9B923NC', img:'https://target.scene7.com/is/image/Target/GUEST_d3317263-7a1c-46e4-9067-8cadaac508b7?wid=200&hei=200&qlt=80'},
    ebay:{ price:79.00, url:'https://www.ebay.com/sch/i.html?_nkw=Instant+Pot+Rio+4qt+810028584124', img:'https://target.scene7.com/is/image/Target/GUEST_d3317263-7a1c-46e4-9067-8cadaac508b7?wid=200&hei=200&qlt=80'},
    wm:{ price:74.99, url:'https://www.walmart.com/search?q=Instant+Pot+Rio+4qt+mini', img:'https://target.scene7.com/is/image/Target/GUEST_d3317263-7a1c-46e4-9067-8cadaac508b7?wid=200&hei=200&qlt=80'},
  },
  { id:3, rank:3, name:'Ninja Crispi Pro 6-in-1 Glass Air Fryer AS101CY', brand:'Ninja',
    upc:'622356594806', category:'Kitchen', weight:9.8, monthly:5800,
    store:'Best Buy', buy:249.99, orig:299.99, disc:17, avail:623, badge:'Top Seller',
    storeUrl:'https://www.bestbuy.com/site/ninja-crispi-pro-6-in-1-countertop-glass-air-fryer-cyberspace/6650389.p',
    mapUrl:'https://www.google.com/maps/search/Best+Buy+near+me',
    img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6650/6650389_sd.jpg',
    amz:{ price:289.99, url:'https://www.amazon.com/s?k=Ninja+Crispi+Pro+AS101+air+fryer', img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6650/6650389_sd.jpg'},
    ebay:{ price:249.00, url:'https://www.ebay.com/sch/i.html?_nkw=Ninja+Crispi+Pro+AS101+622356594806', img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6650/6650389_sd.jpg'},
    wm:{ price:279.99, url:'https://www.walmart.com/search?q=Ninja+Crispi+Pro+AS101+air+fryer', img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6650/6650389_sd.jpg'},
  },
  { id:4, rank:4, name:'DEWALT 20V MAX Drill+Impact Combo Kit DCK240C2', brand:'DEWALT',
    upc:'885911417815', category:'Tools', weight:8.5, monthly:4900,
    store:'Home Depot', buy:159.00, orig:239.00, disc:33, avail:398, badge:'Pro Choice',
    storeUrl:'https://www.homedepot.com/p/DEWALT-20V-MAX-Cordless-Drill-Impact-2-Tool-Combo-Kit-with-2-20V-1-3Ah-Batteries-Charger-and-Bag-DCK240C2/204373168',
    mapUrl:'https://www.google.com/maps/search/Home+Depot+near+me',
    img:'https://images.thdstatic.com/productImages/d4c17273-fb0a-43dd-99bc-2aa7b8076a59/svn/dewalt-power-tool-combo-kits-dck240c2-64_600.jpg',
    amz:{ price:249.00, url:'https://www.amazon.com/s?k=DEWALT+DCK240C2+20V+MAX+drill+impact', img:'https://images.thdstatic.com/productImages/d4c17273-fb0a-43dd-99bc-2aa7b8076a59/svn/dewalt-power-tool-combo-kits-dck240c2-64_600.jpg'},
    ebay:{ price:219.00, url:'https://www.ebay.com/sch/i.html?_nkw=DEWALT+DCK240C2+20V+885911417815', img:'https://images.thdstatic.com/productImages/d4c17273-fb0a-43dd-99bc-2aa7b8076a59/svn/dewalt-power-tool-combo-kits-dck240c2-64_600.jpg'},
    wm:{ price:229.99, url:'https://www.walmart.com/search?q=DEWALT+DCK240C2+drill+impact+combo', img:'https://images.thdstatic.com/productImages/d4c17273-fb0a-43dd-99bc-2aa7b8076a59/svn/dewalt-power-tool-combo-kits-dck240c2-64_600.jpg'},
  },
  { id:5, rank:5, name:'Oral-B iO Series 4 Electric Toothbrush White', brand:'Oral-B',
    upc:'069055134979', category:'Health', weight:1.8, monthly:4200,
    store:'Walgreens', buy:39.99, orig:79.99, disc:50, avail:1204, badge:'Flash Sale',
    storeUrl:'https://www.walgreens.com/store/c/oral-b-io-series-4,-rechargeable-electric-toothbrush-with-brush-head/ID=300468813-product',
    mapUrl:'https://www.google.com/maps/search/Walgreens+near+me',
    img:'https://pics.walgreens.com/prodimg/651314/450.jpg',
    amz:{ price:79.97, url:'https://www.amazon.com/dp/B08J4HMHTQ', img:'https://pics.walgreens.com/prodimg/651314/450.jpg'},
    ebay:{ price:65.00, url:'https://www.ebay.com/sch/i.html?_nkw=Oral-B+iO+Series+4+069055134979', img:'https://pics.walgreens.com/prodimg/651314/450.jpg'},
    wm:{ price:74.99, url:'https://www.walmart.com/search?q=Oral-B+iO+Series+4+electric+toothbrush', img:'https://pics.walgreens.com/prodimg/651314/450.jpg'},
  },
  { id:6, rank:6, name:'Philips Sonicare ProtectiveClean 4100 HX6817', brand:'Philips',
    upc:'075020065148', category:'Health', weight:1.5, monthly:3800,
    store:'Costco', buy:44.99, orig:79.99, disc:44, avail:560, badge:'Member Deal',
    storeUrl:'https://www.costco.com/catalogsearch/results?query=philips+sonicare+4100',
    mapUrl:'https://www.google.com/maps/search/Costco+near+me',
    img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6592/6592018_sd.jpg',
    amz:{ price:79.96, url:'https://www.amazon.com/dp/B078GVDB19', img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6592/6592018_sd.jpg'},
    ebay:{ price:65.00, url:'https://www.ebay.com/sch/i.html?_nkw=Philips+Sonicare+4100+HX6817+075020065148', img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6592/6592018_sd.jpg'},
    wm:{ price:69.99, url:'https://www.walmart.com/search?q=Philips+Sonicare+ProtectiveClean+4100', img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6592/6592018_sd.jpg'},
  },
  { id:7, rank:7, name:'KitchenAid 5-Speed Hand Mixer KHM512', brand:'KitchenAid',
    upc:'883049274941', category:'Kitchen', weight:3.2, monthly:3200,
    store:"Kohl's", buy:39.99, orig:69.99, disc:43, avail:445, badge:'Clearance',
    storeUrl:'https://www.kohls.com/catalog/search.jsp?search=KitchenAid+KHM512+hand+mixer',
    mapUrl:"https://www.google.com/maps/search/Kohl's+near+me",
    img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6478/6478650_sd.jpg',
    amz:{ price:69.99, url:'https://www.amazon.com/dp/B0000CFDVU', img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6478/6478650_sd.jpg'},
    ebay:{ price:55.00, url:'https://www.ebay.com/sch/i.html?_nkw=KitchenAid+KHM512+883049274941', img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6478/6478650_sd.jpg'},
    wm:{ price:62.99, url:'https://www.walmart.com/search?q=KitchenAid+5+speed+hand+mixer', img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6478/6478650_sd.jpg'},
  },
  { id:8, rank:8, name:'Shark Navigator Lift-Away NV352 Vacuum', brand:'Shark',
    upc:'622356543842', category:'Home', weight:12.5, monthly:2900,
    store:"Sam's Club", buy:89.99, orig:159.99, disc:44, avail:312, badge:'Member Savings',
    storeUrl:'https://www.samsclub.com/search?searchTerm=Shark+Navigator+NV352+vacuum',
    mapUrl:"https://www.google.com/maps/search/Sam's+Club+near+me",
    img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/5748/5748007_sd.jpg',
    amz:{ price:159.99, url:'https://www.amazon.com/s?k=Shark+Navigator+NV352+Lift-Away+vacuum', img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/5748/5748007_sd.jpg'},
    ebay:{ price:129.99, url:'https://www.ebay.com/sch/i.html?_nkw=Shark+Navigator+NV352+622356543842', img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/5748/5748007_sd.jpg'},
    wm:{ price:149.99, url:'https://www.walmart.com/search?q=Shark+Navigator+NV352+vacuum', img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/5748/5748007_sd.jpg'},
  },
  { id:9, rank:9, name:'Lodge Cast Iron Skillet 12-inch L10SK3', brand:'Lodge',
    upc:'079035061012', category:'Kitchen', weight:8.0, monthly:2400,
    store:'TJ Maxx', buy:19.99, orig:49.99, disc:60, avail:678, badge:'Deep Discount',
    storeUrl:'https://www.tjmaxx.tjx.com/store/browse/search.jsp?searchKey=Lodge+cast+iron+12',
    mapUrl:'https://www.google.com/maps/search/TJ+Maxx+near+me',
    img:'https://images.thdstatic.com/productImages/de00a2c9-e96d-4d8d-9c80-82c7e0e4095a/svn/lodge-cast-iron-skillets-l10sk3-64_600.jpg',
    amz:{ price:49.90, url:'https://www.amazon.com/dp/B00006JSUA', img:'https://images.thdstatic.com/productImages/de00a2c9-e96d-4d8d-9c80-82c7e0e4095a/svn/lodge-cast-iron-skillets-l10sk3-64_600.jpg'},
    ebay:{ price:38.00, url:'https://www.ebay.com/sch/i.html?_nkw=Lodge+L10SK3+cast+iron+skillet+12', img:'https://images.thdstatic.com/productImages/de00a2c9-e96d-4d8d-9c80-82c7e0e4095a/svn/lodge-cast-iron-skillets-l10sk3-64_600.jpg'},
    wm:{ price:42.99, url:'https://www.walmart.com/search?q=Lodge+cast+iron+skillet+12+inch', img:'https://images.thdstatic.com/productImages/de00a2c9-e96d-4d8d-9c80-82c7e0e4095a/svn/lodge-cast-iron-skillets-l10sk3-64_600.jpg'},
  },
  { id:10, rank:10, name:'Dyson V8 Cordless Vacuum SV10', brand:'Dyson',
    upc:'885609014948', category:'Home', weight:5.6, monthly:2600,
    store:'Best Buy', buy:199.99, orig:349.99, disc:43, avail:289, badge:'Deal of Day',
    storeUrl:'https://www.bestbuy.com/site/searchpage.jsp?st=Dyson+V8+cordless+vacuum',
    mapUrl:'https://www.google.com/maps/search/Best+Buy+near+me',
    img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6481/6481948_sd.jpg',
    amz:{ price:349.00, url:'https://www.amazon.com/s?k=Dyson+V8+SV10+cordless+vacuum', img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6481/6481948_sd.jpg'},
    ebay:{ price:279.00, url:'https://www.ebay.com/sch/i.html?_nkw=Dyson+V8+SV10+885609014948', img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6481/6481948_sd.jpg'},
    wm:{ price:319.99, url:'https://www.walmart.com/search?q=Dyson+V8+cordless+vacuum+SV10', img:'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6481/6481948_sd.jpg'},
  },
  { id:11, rank:11, name:'Ozark Trail 40oz Stainless Insulated Tumbler', brand:'Ozark Trail',
    upc:'191554046023', category:'Outdoors', weight:1.2, monthly:2100,
    store:'Marshalls', buy:9.99, orig:24.99, disc:60, avail:921, badge:'Hot Deal',
    storeUrl:'https://www.marshalls.com/us/store/browse/search.jsp?searchKey=insulated+tumbler+40oz',
    mapUrl:'https://www.google.com/maps/search/Marshalls+near+me',
    img:'https://images.thdstatic.com/productImages/b5e0e4e3-7abb-4d3c-a2d4-5e2df6d84e3c/svn/ozark-trail-tumblers-fba_wmt1101-64_600.jpg',
    amz:{ price:24.99, url:'https://www.amazon.com/s?k=stainless+insulated+tumbler+40oz', img:'https://images.thdstatic.com/productImages/b5e0e4e3-7abb-4d3c-a2d4-5e2df6d84e3c/svn/ozark-trail-tumblers-fba_wmt1101-64_600.jpg'},
    ebay:{ price:19.99, url:'https://www.ebay.com/sch/i.html?_nkw=stainless+tumbler+40oz+insulated', img:'https://images.thdstatic.com/productImages/b5e0e4e3-7abb-4d3c-a2d4-5e2df6d84e3c/svn/ozark-trail-tumblers-fba_wmt1101-64_600.jpg'},
    wm:{ price:21.99, url:'https://www.walmart.com/search?q=Ozark+Trail+40oz+insulated+tumbler', img:'https://images.thdstatic.com/productImages/b5e0e4e3-7abb-4d3c-a2d4-5e2df6d84e3c/svn/ozark-trail-tumblers-fba_wmt1101-64_600.jpg'},
  },
  { id:12, rank:12, name:'Werner 6ft Fiberglass Step Ladder FS106', brand:'Werner',
    upc:'783222006027', category:'Tools', weight:22.0, monthly:1800,
    store:'Ace Hardware', buy:69.99, orig:129.99, disc:46, avail:234, badge:'Sale',
    storeUrl:'https://www.acehardware.com/departments/tools/ladders/step-ladders',
    mapUrl:'https://www.google.com/maps/search/Ace+Hardware+near+me',
    img:'https://images.thdstatic.com/productImages/1a83b3b9-e693-4c0e-8c72-85fc7ee54e4c/svn/werner-step-ladders-fs106-64_600.jpg',
    amz:{ price:129.99, url:'https://www.amazon.com/s?k=Werner+6ft+fiberglass+step+ladder+FS106', img:'https://images.thdstatic.com/productImages/1a83b3b9-e693-4c0e-8c72-85fc7ee54e4c/svn/werner-step-ladders-fs106-64_600.jpg'},
    ebay:{ price:109.99, url:'https://www.ebay.com/sch/i.html?_nkw=Werner+FS106+fiberglass+ladder+783222006027', img:'https://images.thdstatic.com/productImages/1a83b3b9-e693-4c0e-8c72-85fc7ee54e4c/svn/werner-step-ladders-fs106-64_600.jpg'},
    wm:{ price:119.99, url:'https://www.walmart.com/search?q=Werner+6ft+fiberglass+step+ladder', img:'https://images.thdstatic.com/productImages/1a83b3b9-e693-4c0e-8c72-85fc7ee54e4c/svn/werner-step-ladders-fs106-64_600.jpg'},
  },
];

const CATEGORIES = ['Todos','Kitchen','Tools','Health','Home','Outdoors'];
const STORES = ['Todas','Target','Best Buy','Costco',"Kohl's",'Home Depot','Walgreens',"Sam's Club",'TJ Maxx','Marshalls','Ace Hardware'];
const BADGE: Record<string,string[]> = {
  'Bestseller':    ['bg-emerald-500','text-white'],
  'Top Seller':    ['bg-blue-600','text-white'],
  'Flash Sale':    ['bg-red-500','text-white'],
  'Deal of Day':   ['bg-purple-600','text-white'],
  'Clearance':     ['bg-orange-500','text-white'],
  'Hot Deal':      ['bg-pink-500','text-white'],
  'Deep Discount': ['bg-yellow-500','text-gray-900'],
  'Member Deal':   ['bg-teal-600','text-white'],
  'Member Savings':['bg-teal-600','text-white'],
  'Pro Choice':    ['bg-gray-700','text-white'],
  'Sale':          ['bg-indigo-500','text-white'],
};

function Img({src,alt,cls}:{src:string;alt:string;cls:string}) {
  const [err,setErr] = useState(false);
  if(err) return (
    <div className={cls+' bg-slate-700/50 flex flex-col items-center justify-center rounded-xl border border-slate-600/50'}>
      <span className="text-xl">&#128230;</span>
    </div>
  );
  return <img src={src} alt={alt} onError={()=>setErr(true)} className={cls+' object-cover rounded-xl'}/>;
}

function ROIBadge({roi,profit}:{roi:number;profit:number}) {
  const pos = profit > 0;
  const sign = profit >= 0 ? '+' : '-';
  return (
    <div className={'flex-shrink-0 min-w-[100px] text-right px-4 py-3 rounded-xl border '+(pos?'bg-emerald-900/25 border-emerald-500/35':'bg-red-900/25 border-red-500/35')}>
      <div className={'text-xl font-extrabold '+(pos?'text-emerald-400':'text-red-400')}>{sign}${Math.abs(profit).toFixed(2)}</div>
      <div className={'text-sm font-bold '+(roi>0?'text-emerald-300':'text-red-400')}>ROI {roi.toFixed(0)}%</div>
    </div>
  );
}

export default function ScannerPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [store, setStore] = useState('Todas');
  const [minDisc, setMinDisc] = useState(0);
  const [minROI, setMinROI] = useState(0);
  const [mkt, setMkt] = useState('amazon');
  const [expanded, setExpanded] = useState<number|null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return PRODUCTS.filter(p => {
      if (q && !p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q) && !p.upc.includes(q) && !p.store.toLowerCase().includes(q)) return false;
      if (category !== 'Todos' && p.category !== category) return false;
      if (store !== 'Todas' && p.store !== store) return false;
      if (p.disc < minDisc) return false;
      const bk = bestOf(p.buy, p.amz.price, p.ebay.price, p.wm.price, p.weight);
      const all = calcAll(p.buy, p.amz.price, p.ebay.price, p.wm.price, p.weight);
      if ((all as Record<string,{roi:number;profit:number;fees:number}>)[bk].roi < minROI) return false;
      return true;
    });
  }, [search, category, store, minDisc, minROI]);

  const profitable = filtered.filter(p => {
    const bk = bestOf(p.buy, p.amz.price, p.ebay.price, p.wm.price, p.weight);
    const all = calcAll(p.buy, p.amz.price, p.ebay.price, p.wm.price, p.weight);
    return (all as Record<string,{roi:number;profit:number;fees:number}>)[bk].profit > 0;
  }).length;

  const avgROI = filtered.length ? Math.round(filtered.reduce((s,p) => {
    const bk = bestOf(p.buy,p.amz.price,p.ebay.price,p.wm.price,p.weight);
    const all = calcAll(p.buy,p.amz.price,p.ebay.price,p.wm.price,p.weight);
    return s + (all as Record<string,{roi:number;profit:number;fees:number}>)[bk].roi;
  }, 0) / filtered.length) : 0;

  const handleScan = () => {
    setScanning(true); setProgress(0);
    const iv = setInterval(() => setProgress((v:number) => {
      if (v >= 100) { clearInterval(iv); setScanning(false); return 100; }
      return v + 3;
    }), 60);
  };

  const getMktData = (p: typeof PRODUCTS[0]) => {
    const all = calcAll(p.buy, p.amz.price, p.ebay.price, p.wm.price, p.weight);
    const allT = all as Record<string,{roi:number;profit:number;fees:number}>;
    const src = mkt==='amazon'?p.amz:mkt==='ebay'?p.ebay:p.wm;
    const key = mkt==='amazon'?'amazon':mkt==='ebay'?'ebay':'walmart';
    return { src, calc: allT[key] };
  };

  const mktLabel: Record<string,string> = {amazon:'Amazon',ebay:'eBay',walmart:'Walmart Mkt'};
  const mktDot: Record<string,string> = {amazon:'bg-orange-500',ebay:'bg-red-500',walmart:'bg-blue-500'};
  const mkActive: Record<string,string> = {
    amazon:'bg-orange-500/20 border-orange-400 text-orange-300',
    ebay:  'bg-red-500/20 border-red-400 text-red-300',
    walmart:'bg-blue-500/20 border-blue-400 text-blue-300',
  };
  const mkBorder: Record<string,string> = {
    amazon:'border-orange-500/40 bg-orange-950/20',
    ebay:  'border-red-500/40 bg-red-950/20',
    walmart:'border-blue-500/40 bg-blue-950/20',
  };
  const mkBtn: Record<string,string> = {
    amazon:'bg-orange-600 hover:bg-orange-500',
    ebay:  'bg-red-600 hover:bg-red-500',
    walmart:'bg-blue-600 hover:bg-blue-500',
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800/80 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-extrabold text-white">Scanner de Deals</h1>
                <span className="px-2.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wide">Lojas Fisicas</span>
              </div>
              <p className="text-slate-400 text-sm">Compre barato nas lojas fisicas &middot; Venda com lucro &middot; Compare pelo <span className="text-blue-400 font-semibold">mesmo UPC</span></p>
            </div>
            <button onClick={handleScan} disabled={scanning}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow transition">
              {scanning ? 'Escaneando '+progress+'%' : 'Escanear Agora'}
            </button>
          </div>
          {scanning && (
            <div className="w-full bg-slate-700 rounded-full h-1.5 mb-4">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{width:progress+'%'}}/>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3">
              <div className="text-xl font-extrabold text-blue-400">{filtered.length}</div>
              <div className="text-xs text-slate-400">Produtos</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3">
              <div className="text-xl font-extrabold text-emerald-400">{profitable}</div>
              <div className="text-xs text-slate-400">Com Lucro</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3">
              <div className="text-xl font-extrabold text-yellow-400">{avgROI}%</div>
              <div className="text-xs text-slate-400">ROI Medio</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3">
              <div className="text-xl font-extrabold text-purple-400">{STORES.length-1}</div>
              <div className="text-xs text-slate-400">Lojas</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-3">
            <div className="lg:col-span-2">
              <input type="text" placeholder="Produto, marca ou UPC..." value={search} onChange={e=>setSearch(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <select value={category} onChange={e=>setCategory(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              {CATEGORIES.map((c:string)=><option key={c} value={c} style={{backgroundColor:'#1e293b'}}>{c}</option>)}
            </select>
            <select value={store} onChange={e=>setStore(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              {STORES.map((s:string)=><option key={s} value={s} style={{backgroundColor:'#1e293b'}}>{s}</option>)}
            </select>
            <input type="number" min={0} max={90} placeholder="Desc % >=" value={minDisc||''} onChange={e=>setMinDisc(Number(e.target.value)||0)}
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <input type="number" min={0} max={500} placeholder="ROI % >=" value={minROI||''} onChange={e=>setMinROI(Number(e.target.value)||0)}
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div className="flex flex-wrap gap-2">
            {([
              ['ROI 50%+',()=>setMinROI(50)],
              ['Desc 40%+',()=>setMinDisc(40)],
              ['Kitchen',()=>setCategory('Kitchen')],
              ['Tools',()=>setCategory('Tools')],
              ['Health',()=>setCategory('Health')],
              ['Home',()=>setCategory('Home')],
              ['Limpar',()=>{setSearch('');setCategory('Todos');setStore('Todas');setMinDisc(0);setMinROI(0);}],
            ] as [string,()=>void][]).map(([l,fn])=>(
              <button key={l} onClick={fn} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 hover:text-white text-xs rounded-lg transition font-medium">{l}</button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-slate-400 text-sm font-medium">Ver preco em:</span>
          {['amazon','ebay','walmart'].map(m=>(
            <button key={m} onClick={()=>setMkt(m)}
              className={'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 transition '+(mkt===m?mkActive[m]:'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500')}>
              <span className={'w-2.5 h-2.5 rounded-full '+mktDot[m]}/>
              {mktLabel[m]}
            </button>
          ))}
          <span className="ml-auto text-slate-400 text-sm">{filtered.length} de {PRODUCTS.length} produtos</span>
        </div>

        <div className="space-y-3">
          {filtered.length===0&&(
            <div className="text-center py-20 bg-slate-800/40 rounded-2xl border border-slate-700">
              <p className="text-white font-bold text-lg">Nenhum produto encontrado</p>
              <p className="text-slate-400 text-sm mt-1">Ajuste os filtros para ver mais produtos</p>
            </div>
          )}
          {filtered.map(p=>{
            const bk = bestOf(p.buy,p.amz.price,p.ebay.price,p.wm.price,p.weight);
            const allMkt = calcAll(p.buy,p.amz.price,p.ebay.price,p.wm.price,p.weight);
            const allT = allMkt as Record<string,{roi:number;profit:number;fees:number}>;
            const {src:mktSrc,calc:mktCalc} = getMktData(p);
            const isE = expanded===p.id;
            const bdg = BADGE[p.badge]??['bg-slate-600','text-white'];
            return (
              <div key={p.id} className={'rounded-2xl border overflow-hidden transition-all '+(isE?'border-blue-500/50 shadow-xl shadow-blue-900/20':'border-slate-700/50 hover:border-slate-600')}
                style={{background:isE?'rgba(15,23,42,0.98)':'rgba(30,41,59,0.80)'}}>
                <div className="p-4 cursor-pointer select-none" onClick={()=>setExpanded(isE?null:p.id)}>
                  <div className="flex gap-4 items-center">
                    <div className="relative flex-shrink-0">
                      <div className="absolute -top-1 -left-1 z-10 w-6 h-6 bg-blue-600 text-white text-xs font-extrabold rounded-full flex items-center justify-center shadow">{p.rank}</div>
                      <div className="w-[72px] h-[72px] rounded-xl overflow-hidden border border-slate-600 bg-slate-800 flex items-center justify-center">
                        <Img src={p.img} alt={p.name} cls="w-[72px] h-[72px]"/>
                      </div>
                      <div className="text-center mt-1 text-xs text-slate-400 font-medium truncate w-[72px]">{p.store}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className={'px-2 py-0.5 rounded-lg text-xs font-extrabold '+bdg[0]+' '+bdg[1]}>{p.badge}</span>
                        <code className="text-xs text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-lg font-mono">UPC: {p.upc}</code>
                        {bk===mkt&&<span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-bold rounded-lg">Melhor Mkt</span>}
                      </div>
                      <h3 className="font-bold text-white text-sm leading-snug">{p.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs">
                        <span className="text-slate-300">Compra: <strong className="text-emerald-400">${p.buy.toFixed(2)}</strong> <span className="line-through text-slate-500">${p.orig}</span> <span className="text-red-400 font-bold">-{p.disc}%</span></span>
                        <span className="text-slate-300">Venda: <strong className="text-blue-300">${mktSrc.price.toFixed(2)}</strong></span>
                        <span className="text-slate-500">{p.monthly.toLocaleString()}/mes</span>
                        <span className="text-slate-500">{p.avail} unid.</span>
                      </div>
                    </div>
                    <ROIBadge roi={mktCalc.roi} profit={mktCalc.profit}/>
                  </div>
                </div>

                {isE&&(
                  <div className="border-t border-slate-700 bg-slate-900/60 p-5">
                    <div className="flex items-center gap-3 mb-5 p-3 bg-blue-900/20 border border-blue-700/30 rounded-xl">
                      <span className="text-blue-400 font-bold text-sm">Comparando pelo mesmo UPC:</span>
                      <code className="bg-blue-900/40 border border-blue-600/40 text-blue-200 text-sm font-mono px-3 py-1 rounded-lg font-extrabold tracking-wider">{p.upc}</code>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                      <div className="xl:col-span-3 space-y-3">
                        <div className="rounded-xl border-2 border-emerald-500/50 bg-emerald-950/20 p-4">
                          <p className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest mb-3">COMPRAR EM {p.store}</p>
                          <div className="flex gap-4 items-center">
                            <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-600 bg-slate-800 flex-shrink-0 flex items-center justify-center">
                              <Img src={p.img} alt={p.name} cls="w-20 h-20"/>
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-bold text-sm mb-1">{p.name}</p>
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-2xl font-extrabold text-emerald-400">${p.buy.toFixed(2)}</span>
                                <span className="text-sm text-slate-500 line-through">${p.orig}</span>
                                <span className="text-sm text-red-400 font-bold">-{p.disc}%</span>
                              </div>
                              <p className="text-xs text-slate-400 font-mono">{p.upc} &middot; {p.weight} lbs</p>
                            </div>
                            <a href={p.storeUrl} target="_blank" rel="noopener noreferrer"
                              className="flex-shrink-0 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition whitespace-nowrap">
                              Ver em {p.store} &rarr;
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-1">
                          <div className="flex-1 h-px bg-slate-700"/>
                          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Vender nos Marketplaces</p>
                          <div className="flex-1 h-px bg-slate-700"/>
                        </div>
                        {(['amazon','ebay','walmart'] as const).map(mk=>{
                          const mc2 = allT[mk==='amazon'?'amazon':mk==='ebay'?'ebay':'walmart'];
                          const mSrc = mk==='amazon'?p.amz:mk==='ebay'?p.ebay:p.wm;
                          const ib = bk===mk;
                          return (
                            <div key={mk} className={'rounded-xl border-2 p-4 '+(ib?mkBorder[mk]+' shadow-lg':'border-slate-700/40 bg-slate-800/30')}>
                              <div className="flex items-start gap-3">
                                <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-600/50 bg-slate-800 flex-shrink-0 flex items-center justify-center">
                                  <Img src={mSrc.img} alt={p.name} cls="w-16 h-16"/>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className={'w-2.5 h-2.5 rounded-full '+mktDot[mk]}/>
                                      <span className="text-sm font-extrabold text-white">{mktLabel[mk]}</span>
                                      {ib&&<span className="text-xs font-bold px-1.5 py-0.5 rounded-lg border bg-yellow-500/20 border-yellow-500/40 text-yellow-400">Melhor</span>}
                                    </div>
                                    <span className="text-lg font-extrabold text-white">${mSrc.price.toFixed(2)}</span>
                                  </div>
                                  <div className="grid grid-cols-4 gap-1 text-xs mb-2">
                                    {([
                                      ['Custo','$'+p.buy.toFixed(2),'text-slate-300','bg-slate-800/80'],
                                      ['Taxas','$'+mc2.fees.toFixed(2),'text-red-300','bg-slate-800/80'],
                                      ['Lucro',(mc2.profit>=0?'+':'-')+'$'+Math.abs(mc2.profit).toFixed(2),mc2.profit>0?'text-emerald-400':'text-red-400',mc2.profit>0?'bg-emerald-900/30':'bg-red-900/30'],
                                      ['ROI',mc2.roi.toFixed(0)+'%',mc2.roi>0?'text-emerald-400':'text-red-400',mc2.roi>0?'bg-emerald-900/30':'bg-red-900/30'],
                                    ] as const).map(([lbl,val,vc,bg])=>(
                                      <div key={lbl} className={'rounded-lg p-1.5 text-center '+bg}>
                                        <div className="text-slate-500 text-xs">{lbl}</div>
                                        <div className={'font-extrabold text-xs '+vc}>{val}</div>
                                      </div>
                                    ))}
                                  </div>
                                  <p className="text-xs text-slate-500 italic">
                                    {mk==='amazon'&&('Amazon: 15% ref + FBA $'+fbaFee(p.weight).toFixed(2)+' + frete $'+shipFee(p.weight).toFixed(2))}
                                    {mk==='ebay'&&'eBay: 13.6% final value fee + $0.40/pedido'}
                                    {mk==='walmart'&&'Walmart Marketplace: 8% referral fee'}
                                  </p>
                                </div>
                              </div>
                              <a href={mSrc.url} target="_blank" rel="noopener noreferrer"
                                className={'mt-3 flex items-center justify-center w-full py-2.5 text-white text-xs font-bold rounded-xl transition '+mkBtn[mk]}>
                                Ver em {mktLabel[mk]} &rarr;
                              </a>
                            </div>
                          );
                        })}
                      </div>
                      <div className="xl:col-span-2 flex flex-col gap-3">
                        <div className="rounded-xl border border-yellow-500/30 bg-yellow-900/10 p-4">
                          <p className="text-xs font-extrabold text-yellow-400 uppercase tracking-widest mb-3">Melhor Opcao</p>
                          <div className="flex items-center gap-2 mb-3">
                            <span className={'w-3.5 h-3.5 rounded-full '+mktDot[bk]}/>
                            <span className="text-lg font-extrabold text-white">{mktLabel[bk]}</span>
                          </div>
                          {(()=>{
                            const bc=allT[bk];
                            const bprice=bk==='amazon'?p.amz.price:bk==='ebay'?p.ebay.price:p.wm.price;
                            return(
                              <div className="space-y-2">
                                <div className="flex justify-between items-center py-1 border-b border-slate-700/50">
                                  <span className="text-slate-400 text-sm">Lucro</span>
                                  <span className={'font-extrabold text-lg '+(bc.profit>0?'text-emerald-400':'text-red-400')}>{bc.profit>=0?'+':'-'}${Math.abs(bc.profit).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-slate-700/50">
                                  <span className="text-slate-400 text-sm">ROI</span>
                                  <span className={'font-extrabold text-lg '+(bc.roi>0?'text-emerald-400':'text-red-400')}>{bc.roi.toFixed(0)}%</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-slate-700/50">
                                  <span className="text-slate-400 text-sm">Taxas</span>
                                  <span className="font-bold text-red-300">${bc.fees.toFixed(2)}</span>
                                </div>
                                <div className="pt-1 flex justify-between text-xs text-slate-500">
                                  <span>Compra ${p.buy.toFixed(2)}</span><span>Vende ${bprice.toFixed(2)}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-3 flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-bold text-white text-sm">{p.store}</p>
                              <p className="text-xs text-slate-400">{p.avail} unidades disponiveis</p>
                            </div>
                            <a href={p.mapUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition">Mapa</a>
                          </div>
                          <iframe src={'https://maps.google.com/maps?q='+encodeURIComponent(p.store+' near me')+'&output=embed'}
                            className="w-full rounded-xl" height="180" style={{border:0}} loading="lazy"/>
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
