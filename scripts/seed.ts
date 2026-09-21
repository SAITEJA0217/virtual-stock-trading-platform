import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { STOCKS, saveCsv } from './generate-market-data';
import { validateCsv } from './validate-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Database Seeding Process...');

  const csvPath = path.join(process.cwd(), 'data', 'market-data.csv');
  if (!fs.existsSync(csvPath)) {
    console.log('📄 Market CSV not found, generating fresh dataset...');
    saveCsv();
  }

  // Validate CSV
  console.log('🔍 Validating CSV dataset...');
  const valResult = validateCsv(csvPath);
  if (!valResult.success) {
    throw new Error(`CSV validation failed with errors: \n${valResult.errors.join('\n')}`);
  }
  console.log(`✅ CSV validation passed (${valResult.stats.totalRows} rows).`);

  // 1. Predefined User Setup
  console.log('👤 Setting up predefined user (Demo Trader)...');
  const existingUser = await prisma.user.findFirst();
  let user;
  if (!existingUser) {
    user = await prisma.user.create({
      data: {
        name: 'Demo Trader',
        cashBalance: 1000000.0
      }
    });
    console.log(`✅ Created User: ${user.name} with cash balance ₹${user.cashBalance.toLocaleString('en-IN')}`);
  } else {
    user = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        cashBalance: 1000000.0
      }
    });
    console.log(`✅ Updated existing User: ${user.name} with reset cash balance ₹${user.cashBalance.toLocaleString('en-IN')}`);
  }

  // 2. Stocks Setup
  console.log('🏢 Upserting 10 Indian equity stocks...');
  const stockMap = new Map<string, string>(); // symbol -> id

  for (const s of STOCKS) {
    const stockRecord = await prisma.stock.upsert({
      where: { symbol: s.symbol },
      update: {
        name: s.name,
        sector: s.sector
      },
      create: {
        symbol: s.symbol,
        name: s.name,
        sector: s.sector
      }
    });
    stockMap.set(s.symbol, stockRecord.id);
  }
  console.log(`✅ Upserted ${stockMap.size} stocks.`);

  // 3. Import Market Data from CSV
  console.log('📊 Importing Market Data records into SQLite database...');
  const fileContent = fs.readFileSync(csvPath, 'utf-8').trim();
  const lines = fileContent.split('\n').map(l => l.trim()).filter(Boolean);

  const marketDataList: {
    stockId: string;
    timestamp: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    const symbol = cols[0];
    const timestampStr = cols[3];
    const open = parseFloat(cols[4]);
    const high = parseFloat(cols[5]);
    const low = parseFloat(cols[6]);
    const close = parseFloat(cols[7]);
    const volume = parseInt(cols[8], 10);

    const stockId = stockMap.get(symbol);
    if (!stockId) {
      console.warn(`Warning: Stock symbol ${symbol} not found in DB mapping.`);
      continue;
    }

    marketDataList.push({
      stockId,
      timestamp: new Date(timestampStr),
      open,
      high,
      low,
      close,
      volume
    });
  }

  // Clear existing market data for fresh clean seed
  console.log('🧹 Clearing previous MarketData to ensure clean state...');
  await prisma.marketData.deleteMany({});

  // Batch insert into Prisma
  const BATCH_SIZE = 250;
  for (let i = 0; i < marketDataList.length; i += BATCH_SIZE) {
    const batch = marketDataList.slice(i, i + BATCH_SIZE);
    await prisma.marketData.createMany({
      data: batch
    });
  }

  const totalMarketCount = await prisma.marketData.count();
  console.log(`✅ Successfully seeded ${totalMarketCount} MarketData records!`);
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
