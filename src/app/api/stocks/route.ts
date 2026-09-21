import { NextRequest, NextResponse } from 'next/server';
import { getSimulationTargetDate, getAllStocksWithPrices } from '@/lib/market-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timestampParam = searchParams.get('timestamp');
    const targetTimestamp = await getSimulationTargetDate(timestampParam);

    const stocks = await getAllStocksWithPrices(targetTimestamp);

    return NextResponse.json({
      timestamp: targetTimestamp.toISOString(),
      stocks,
    });
  } catch (error) {
    console.error('API Error in /api/stocks:', error);
    return NextResponse.json({ error: 'Failed to fetch stocks' }, { status: 500 });
  }
}
