import { prisma } from './prisma';
import { calculatePriceChange } from './calculations';

export async function getSimulationTargetDate(timestampParam?: string | null): Promise<Date> {
  if (timestampParam) {
    const parsed = new Date(timestampParam);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // Default to the latest available timestamp in the database
  const latestRecord = await prisma.marketData.findFirst({
    orderBy: { timestamp: 'desc' },
    select: { timestamp: true },
  });

  return latestRecord?.timestamp || new Date('2026-09-21T15:30:00.000Z');
}

export async function getStockPriceAtTimestamp(stockId: string, targetTimestamp: Date) {
  // Find latest record at or before the requested timestamp
  let record = await prisma.marketData.findFirst({
    where: {
      stockId,
      timestamp: {
        lte: targetTimestamp,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  });

  // If no record prior to timestamp (e.g. requested timestamp is before dataset begins), fetch earliest
  if (!record) {
    record = await prisma.marketData.findFirst({
      where: { stockId },
      orderBy: { timestamp: 'asc' },
    });
  }

  if (!record) {
    return null;
  }

  // Find previous record to calculate interval change
  const previousRecord = await prisma.marketData.findFirst({
    where: {
      stockId,
      timestamp: {
        lt: record.timestamp,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  });

  const previousClose = previousRecord ? previousRecord.close : record.open;
  const { change, changePercent } = calculatePriceChange(record.close, previousClose);
  const isExactMatch = record.timestamp.getTime() === targetTimestamp.getTime();

  return {
    record,
    previousClose,
    change,
    changePercent,
    isExactMatch,
  };
}

export async function getAllStocksWithPrices(targetTimestamp: Date) {
  const stocks = await prisma.stock.findMany({
    orderBy: { symbol: 'asc' },
  });

  const results = await Promise.all(
    stocks.map(async (stock) => {
      const priceData = await getStockPriceAtTimestamp(stock.id, targetTimestamp);
      if (!priceData) {
        return null;
      }

      return {
        id: stock.id,
        symbol: stock.symbol,
        name: stock.name,
        sector: stock.sector,
        currentPrice: priceData.record.close,
        openPrice: priceData.record.open,
        highPrice: priceData.record.high,
        lowPrice: priceData.record.low,
        previousClose: priceData.previousClose,
        priceChange: priceData.change,
        priceChangePercent: priceData.changePercent,
        volume: priceData.record.volume,
        timestamp: priceData.record.timestamp.toISOString(),
        isExactMatch: priceData.isExactMatch,
      };
    })
  );

  return results.filter(Boolean);
}

export async function getAvailableTimestamps() {
  const distinctRecords = await prisma.marketData.findMany({
    select: { timestamp: true },
    distinct: ['timestamp'],
    orderBy: { timestamp: 'asc' },
  });

  const timestamps = distinctRecords.map((r) => {
    const iso = r.timestamp.toISOString();
    const date = iso.split('T')[0];
    const timeFull = iso.split('T')[1].substring(0, 5);
    return {
      timestamp: iso,
      date,
      time: timeFull,
    };
  });

  const availableDates = Array.from(new Set(timestamps.map((t) => t.date))).sort();
  const availableTimes = Array.from(new Set(timestamps.map((t) => t.time))).sort();

  return {
    allTimestamps: timestamps,
    availableDates,
    availableTimes,
    latest: timestamps[timestamps.length - 1] || null,
    earliest: timestamps[0] || null,
  };
}
