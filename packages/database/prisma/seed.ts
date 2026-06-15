import { PrismaClient, StoreType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminHash = await bcrypt.hash('Admin@123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@retailarbitrage.com' },
    update: {},
    create: {
      email: 'admin@retailarbitrage.com',
      passwordHash: adminHash,
      name: 'System Admin',
      role: 'ADMIN',
      plan: 'ENTERPRISE',
      emailVerified: true,
      settings: {
        create: {
          minRoi: 30, minProfit: 10, maxBudget: 5000,
          preferredMarketplaces: ['AMAZON', 'WALMART', 'EBAY'],
          alertEmail: true, alertPush: true,
        },
      },
      watchlists: { create: { name: 'My Watchlist', isDefault: true } },
    },
  });

  const demoHash = await bcrypt.hash('Demo@123!', 12);
  await prisma.user.upsert({
    where: { email: 'demo@retailarbitrage.com' },
    update: {},
    create: {
      email: 'demo@retailarbitrage.com',
      passwordHash: demoHash,
      name: 'Demo User',
      role: 'USER',
      plan: 'PRO',
      emailVerified: true,
      settings: {
        create: {
          minRoi: 25, minProfit: 8, maxBudget: 2000,
          homeZipCode: '10001',
          homeLatitude: 40.7484, homeLongitude: -73.9967,
          searchRadiusMiles: 30,
        },
      },
      watchlists: { create: { name: 'My Watchlist', isDefault: true } },
    },
  });

  const stores = [
    { name: 'Walmart', slug: 'walmart', website: 'https://www.walmart.com', storeType: 'BOTH' as StoreType, hasApi: true, logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Walmart_Spark.svg/60px-Walmart_Spark.svg.png' },
    { name: 'Target', slug: 'target', website: 'https://www.target.com', storeType: 'BOTH' as StoreType, hasApi: false, logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Target_logo.svg/60px-Target_logo.svg.png' },
    { name: 'Costco', slug: 'costco', website: 'https://www.costco.com', storeType: 'BOTH' as StoreType, hasApi: false, logoUrl: null },
    { name: "Sam's Club", slug: 'samsclub', website: 'https://www.samsclub.com', storeType: 'BOTH' as StoreType, hasApi: false, logoUrl: null },
    { name: 'Best Buy', slug: 'bestbuy', website: 'https://www.bestbuy.com', storeType: 'BOTH' as StoreType, hasApi: true, logoUrl: null },
    { name: 'Home Depot', slug: 'homedepot', website: 'https://www.homedepot.com', storeType: 'BOTH' as StoreType, hasApi: false, logoUrl: null },
    { name: "Lowe's", slug: 'lowes', website: 'https://www.lowes.com', storeType: 'BOTH' as StoreType, hasApi: false, logoUrl: null },
    { name: 'CVS', slug: 'cvs', website: 'https://www.cvs.com', storeType: 'BOTH' as StoreType, hasApi: false, logoUrl: null },
    { name: 'Walgreens', slug: 'walgreens', website: 'https://www.walgreens.com', storeType: 'BOTH' as StoreType, hasApi: false, logoUrl: null },
    { name: "Kohl's", slug: 'kohls', website: 'https://www.kohls.com', storeType: 'BOTH' as StoreType, hasApi: false, logoUrl: null },
    { name: "Macy's", slug: 'macys', website: 'https://www.macys.com', storeType: 'BOTH' as StoreType, hasApi: false, logoUrl: null },
  ];

  for (const store of stores) {
    await prisma.retailStore.upsert({
      where: { slug: store.slug },
      update: { isActive: true },
      create: store,
    });
  }

  // Sample products for demo
  const products = [
    { upc: '885370481693', asin: 'B07XJ8C8F5', title: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Quart', brand: 'Instant Pot', category: 'Kitchen Appliances', imageUrl: 'https://m.media-amazon.com/images/I/71V0gvNzAKL._AC_SL1500_.jpg', weightLbs: 11.8, lengthIn: 13.4, widthIn: 12.2, heightIn: 12.5 },
    { upc: '616013700992', asin: 'B08N5WRWNW', title: 'Echo Dot (4th Gen) Smart Speaker with Alexa', brand: 'Amazon', category: 'Electronics', imageUrl: 'https://m.media-amazon.com/images/I/714Rq4k05UL._AC_SL1000_.jpg', weightLbs: 0.78, lengthIn: 3.9, widthIn: 3.9, heightIn: 3.5 },
    { upc: '050000207428', asin: 'B09JQMJHXY', title: 'Vitamix 5200 Blender Professional-Grade', brand: 'Vitamix', category: 'Kitchen Appliances', imageUrl: 'https://m.media-amazon.com/images/I/61Oj9Z7KmLL._AC_SL1500_.jpg', weightLbs: 10.6, lengthIn: 8.75, widthIn: 7.25, heightIn: 20.5 },
    { upc: '043396574151', asin: 'B07W6BXFVD', title: 'Sony WH-1000XM4 Wireless Noise Canceling Headphones', brand: 'Sony', category: 'Electronics', imageUrl: 'https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SL1500_.jpg', weightLbs: 0.55, lengthIn: 10.0, widthIn: 7.3, heightIn: 3.5 },
    { upc: '801314628200', asin: 'B07ZPKN6YR', title: 'iRobot Roomba i3+ EVO Self-Emptying Robot Vacuum', brand: 'iRobot', category: 'Home Appliances', imageUrl: 'https://m.media-amazon.com/images/I/71MsVHq4EFL._AC_SL1500_.jpg', weightLbs: 7.44, lengthIn: 13.35, widthIn: 13.35, heightIn: 3.56 },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { upc: product.upc },
      update: {},
      create: product,
    });
  }

  console.log('✅ Seed completed');
  console.log('👤 Admin: admin@retailarbitrage.com / Admin@123!');
  console.log('👤 Demo:  demo@retailarbitrage.com  / Demo@123!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
