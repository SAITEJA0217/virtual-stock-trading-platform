import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSimulationTargetDate } from '@/lib/market-service';

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
      return NextResponse.json({ error: `Stock ${symbol} not found` }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const timestampParam = searchParams.get('timestamp');
    const timeframe = (searchParams.get('timeframe') || '1D').toUpperCase();
    const targetTimestamp = await getSimulationTargetDate(timestampParam);

    const recordsBefore = await prisma.marketData.findMany({
      where: {
        stockId: stock.id,
        timestamp: {
          lte: targetTimestamp,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    if (recordsBefore.length === 0) {
      return NextResponse.json({ candles: [] });
    }

    const uniqueDates = Array.from(
      new Set(recordsBefore.map((r) => r.timestamp.toISOString().split('T')[0]))
    ).sort();

    let filteredDates: string[] = [];
    if (timeframe === '1D') {
      filteredDates = uniqueDates.slice(-1);
    } else if (timeframe === '5D') {
      filteredDates = uniqueDates.slice(-5);
    } else if (timeframe === '10D') {
      filteredDates = uniqueDates.slice(-10);
    } else {
      filteredDates = uniqueDates;
    }

    const earliestAllowedDate = filteredDates[0];
    const startDate = new Date(`${earliestAllowedDate}T00:00:00.000Z`);

    const candles = recordsBefore
      .filter((r) => r.timestamp >= startDate)
      .map((r) => {
        const iso = r.timestamp.toISOString();
        const date = iso.split('T')[0];
        const time = iso.split('T')[1].substring(0, 5);
        return {
          timestamp: iso,
          date,
          time,
          open: r.open,
          high: r.high,
          low: r.low,
          close: r.close,
          volume: r.volume,
        };
      });

    return NextResponse.json({
      symbol: stock.symbol,
      timeframe,
      candles,
    });
  } catch (error) {
    console.error('API Error in /api/market-data/[symbol]:', error);
    return NextResponse.json({ error: 'Failed to fetch historical market data' }, { status: 500 });
  }
}
