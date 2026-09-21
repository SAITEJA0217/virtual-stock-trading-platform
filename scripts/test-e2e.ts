import { PrismaClient } from '@prisma/client';
import { getStockPriceAtTimestamp, getAllStocksWithPrices } from '../src/lib/market-service';
import { calculateWeightedAverageBuyPrice, calculateRealizedPL, calculateUnrealizedPL } from '../src/lib/calculations';

const prisma = new PrismaClient();

async function runE2ETests() {
  console.log('🧪 ========================================================');
  console.log('🧪 RUNNING COMPREHENSIVE VIRTUAL TRADING PLATFORM E2E TESTS');
  console.log('🧪 ========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Verify User Initial State
    const user = await prisma.user.findFirst();
    assert(!!user, 'Predefined user exists');
    assert(user?.name === 'Demo Trader', 'User is Demo Trader');
    assert(user?.cashBalance === 1000000.0, 'Starting cash balance is ₹10,00,000.00');

    // 2. Verify Stocks in Database
    const stockCount = await prisma.stock.count();
    assert(stockCount === 10, `Exactly 10 stocks in DB (Found ${stockCount})`);

    const tcs = await prisma.stock.findUnique({ where: { symbol: 'TCS' } });
    assert(!!tcs && tcs.sector === 'IT', 'TCS stock exists in IT sector');

    // 3. Verify Market Data Records
    const marketCount = await prisma.marketData.count();
    assert(marketCount === 2100, `Exactly 2,100 market data records seeded (Found ${marketCount})`);

    // 4. Test Historical Date/Time Price Lookup
    const testTimestamp = new Date('2026-09-15T10:45:00.000Z');
    const priceData = await getStockPriceAtTimestamp(tcs!.id, testTimestamp);
    assert(!!priceData && priceData.isExactMatch, 'Exact timestamp match on 15 Sep 2026, 10:45 AM');
    assert(priceData!.record.close > 0, `Retrieved valid TCS Close price: ₹${priceData?.record.close}`);
    assert(
      priceData!.record.low <= priceData!.record.open &&
      priceData!.record.open <= priceData!.record.high &&
      priceData!.record.low <= priceData!.record.close &&
      priceData!.record.close <= priceData!.record.high,
      'OHLC integrity holds (low <= open/close <= high)'
    );

    // 5. Test Fallback for intermediate timestamp (e.g. 10:37 AM)
    const intermediateTimestamp = new Date('2026-09-15T10:37:00.000Z');
    const fallbackData = await getStockPriceAtTimestamp(tcs!.id, intermediateTimestamp);
    assert(!!fallbackData && !fallbackData.isExactMatch, 'Fallback detected for intermediate timestamp 10:37 AM');
    assert(
      fallbackData?.record.timestamp.toISOString() === '2026-09-15T10:15:00.000Z',
      'Fallback resolves to latest previous interval (10:15 AM)'
    );

    // 6. Test All Stocks at Timestamp
    const allStocks = await getAllStocksWithPrices(testTimestamp);
    assert(allStocks.length === 10, 'All 10 stocks returned with prices at simulation timestamp');

    // 7. Simulate BUY 5 Shares of TCS
    const initialCash = user!.cashBalance;
    const buyQty = 5;
    const buyPrice = priceData!.record.close;
    const buyTotal = buyQty * buyPrice;

    // Execute atomic Buy simulation
    const buyTx = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: user!.id },
        data: { cashBalance: initialCash - buyTotal },
      });

      const h = await tx.portfolioHolding.create({
        data: {
          userId: user!.id,
          stockId: tcs!.id,
          quantity: buyQty,
          averageBuyPrice: buyPrice,
        },
      });

      const t = await tx.transaction.create({
        data: {
          userId: user!.id,
          stockId: tcs!.id,
          type: 'BUY',
          quantity: buyQty,
          price: buyPrice,
          totalAmount: buyTotal,
          timestamp: testTimestamp,
        },
      });

      return { u, h, t };
    });

    assert(buyTx.u.cashBalance === initialCash - buyTotal, `Cash reduced to ₹${buyTx.u.cashBalance}`);
    assert(buyTx.h.quantity === 5, 'Holding created with quantity = 5');
    assert(buyTx.h.averageBuyPrice === buyPrice, `Holding avg price = ₹${buyPrice}`);
    assert(buyTx.t.type === 'BUY', 'Transaction logged as BUY');

    // 8. Test Mark-to-Market Unrealized P/L at later timestamp
    const laterTimestamp = new Date('2026-09-18T15:30:00.000Z');
    const laterPriceData = await getStockPriceAtTimestamp(tcs!.id, laterTimestamp);
    const laterPrice = laterPriceData!.record.close;
    const { amount: unrealizedPL, percent: unrealizedPLPct } = calculateUnrealizedPL(
      laterPrice,
      buyPrice,
      5
    );
    assert(
      unrealizedPL === Number(((laterPrice - buyPrice) * 5).toFixed(2)),
      `Unrealized P/L accurately computed: ₹${unrealizedPL} (${unrealizedPLPct}%)`
    );

    // 9. Simulate SELL 2 Shares of TCS
    const sellQty = 2;
    const sellPrice = laterPrice;
    const sellTotal = sellQty * sellPrice;
    const expectedRealizedPL = calculateRealizedPL(sellPrice, buyPrice, sellQty);

    const sellTx = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: user!.id },
        data: { cashBalance: buyTx.u.cashBalance + sellTotal },
      });

      const h = await tx.portfolioHolding.update({
        where: { id: buyTx.h.id },
        data: { quantity: buyTx.h.quantity - sellQty },
      });

      const t = await tx.transaction.create({
        data: {
          userId: user!.id,
          stockId: tcs!.id,
          type: 'SELL',
          quantity: sellQty,
          price: sellPrice,
          totalAmount: sellTotal,
          timestamp: laterTimestamp,
        },
      });

      return { u, h, t };
    });

    assert(sellTx.h.quantity === 3, `Holding reduced from 5 to 3 shares (Found ${sellTx.h.quantity})`);
    assert(sellTx.u.cashBalance === buyTx.u.cashBalance + sellTotal, `Cash increased by proceeds: ₹${sellTotal}`);
    assert(sellTx.t.type === 'SELL', 'Transaction logged as SELL');
    assert(
      expectedRealizedPL === Number(((sellPrice - buyPrice) * sellQty).toFixed(2)),
      `Realized P/L verified: ₹${expectedRealizedPL}`
    );

    // 10. Verify Transaction History Ledger
    const transactions = await prisma.transaction.findMany({
      where: { userId: user!.id },
      orderBy: { timestamp: 'desc' },
    });
    assert(transactions.length === 2, `2 transactions logged in audit history (Found ${transactions.length})`);
    assert(transactions[0].type === 'SELL' && transactions[1].type === 'BUY', 'Newest transaction is first');

    // 11. Clean test trades and reset user balance to fresh starting capital
    await prisma.transaction.deleteMany({ where: { userId: user!.id } });
    await prisma.portfolioHolding.deleteMany({ where: { userId: user!.id } });
    await prisma.user.update({
      where: { id: user!.id },
      data: { cashBalance: 1000000.0 },
    });
    console.log('\n🧹 Reset test state back to pristine demo state (₹10,00,000 balance, 0 holdings, 0 transactions).');

    console.log('\n========================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
