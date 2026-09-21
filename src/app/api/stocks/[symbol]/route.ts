import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSimulationTargetDate, getStockPriceAtTimestamp } from '@/lib/market-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const resolvedParams = await params;
    const symbol = resolvedParams.symbol?.toUpperCase();

    if (!symbol) {
      return NextResponse.json({ error: 'Stock symbol is required' }, { status: 400 });
    }

    const stock = await prisma.stock.findUnique({
      where: { symbol },
    });

    if (!stock) {
      return NextResponse.json({ error: `Stock with symbol ${symbol} not found` }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const timestampParam = searchParams.get('timestamp');
    const targetTimestamp = await getSimulationTargetDate(timestampParam);

    const priceData = await getStockPriceAtTimestamp(stock.id, targetTimestamp);
    if (!priceData) {
      return NextResponse.json({ error: 'Market data not available for this stock' }, { status: 404 });
    }

    const targetDateStr = targetTimestamp.toISOString().split('T')[0];
    const dayStart = new Date(`${targetDateStr}T00:00:00.000Z`);
    
    const dayRecords = await prisma.marketData.findMany({
      where: {
        stockId: stock.id,
        timestamp: {
          gte: dayStart,
          lte: targetTimestamp,
        },
      },
    });

    let dayHigh = priceData.record.high;
    let dayLow = priceData.record.low;
    let totalDayVolume = priceData.record.volume;

    if (dayRecords.length > 0) {
      dayHigh = Math.max(...dayRecords.map((r) => r.high));
      dayLow = Math.min(...dayRecords.map((r) => r.low));
      totalDayVolume = dayRecords.reduce((acc, r) => acc + r.volume, 0);
    }

    return NextResponse.json({
      stock: {
        id: stock.id,
        symbol: stock.symbol,
        name: stock.name,
        sector: stock.sector,
        currentPrice: priceData.record.close,
        openPrice: priceData.record.open,
        highPrice: priceData.record.high,
        lowPrice: priceData.record.low,
        dayHigh,
        dayLow,
        previousClose: priceData.previousClose,
        priceChange: priceData.change,
        priceChangePercent: priceData.changePercent,
        volume: priceData.record.volume,
        dayVolume: totalDayVolume,
        timestamp: priceData.record.timestamp.toISOString(),
        isExactMatch: priceData.isExactMatch,
      },
    });
  } catch (error) {
    console.error('API Error in /api/stocks/[symbol]:', error);
    return NextResponse.json({ error: 'Failed to fetch stock details' }, { status: 500 });
  }
}
