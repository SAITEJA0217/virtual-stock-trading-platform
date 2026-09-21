import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSimulationTargetDate, getStockPriceAtTimestamp } from '@/lib/market-service';
import { calculateUnrealizedPL } from '@/lib/calculations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timestampParam = searchParams.get('timestamp');
    const targetTimestamp = await getSimulationTargetDate(timestampParam);

    const user = await prisma.user.findFirst({
      include: {
        holdings: {
          where: {
            quantity: {
              gt: 0,
            },
          },
          include: {
            stock: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        holdings: [],
        summary: {
          totalInvested: 0,
          currentValue: 0,
          unrealizedPL: 0,
          unrealizedPLPercent: 0,
        },
      });
    }

    let totalInvested = 0;
    let totalCurrentValue = 0;

    const rawHoldings = await Promise.all(
      user.holdings.map(async (holding) => {
        const priceInfo = await getStockPriceAtTimestamp(holding.stockId, targetTimestamp);
        const currentPrice = priceInfo ? priceInfo.record.close : holding.averageBuyPrice;
        const investedAmount = Number((holding.quantity * holding.averageBuyPrice).toFixed(2));
        const currentValue = Number((holding.quantity * currentPrice).toFixed(2));
        const { amount: unrealizedPL, percent: unrealizedPLPercent } = calculateUnrealizedPL(
          currentPrice,
          holding.averageBuyPrice,
          holding.quantity
        );

        totalInvested += investedAmount;
        totalCurrentValue += currentValue;

        return {
          id: holding.id,
          stockId: holding.stockId,
          symbol: holding.stock.symbol,
          name: holding.stock.name,
          sector: holding.stock.sector,
          quantity: holding.quantity,
          averageBuyPrice: Number(holding.averageBuyPrice.toFixed(2)),
          currentPrice: Number(currentPrice.toFixed(2)),
          investedAmount,
          currentValue,
          unrealizedPL,
          unrealizedPLPercent,
        };
      })
    );

    const holdings = rawHoldings.map((h) => ({
      ...h,
      allocationPercent:
        totalCurrentValue > 0
          ? Number(((h.currentValue / totalCurrentValue) * 100).toFixed(2))
          : 0,
    }));

    const totalUnrealizedPL = Number((totalCurrentValue - totalInvested).toFixed(2));
    const totalUnrealizedPLPercent =
      totalInvested > 0 ? Number(((totalUnrealizedPL / totalInvested) * 100).toFixed(2)) : 0;

    return NextResponse.json({
      holdings,
      summary: {
        totalInvested: Number(totalInvested.toFixed(2)),
        currentValue: Number(totalCurrentValue.toFixed(2)),
        unrealizedPL: totalUnrealizedPL,
        unrealizedPLPercent: totalUnrealizedPLPercent,
      },
    });
  } catch (error) {
    console.error('API Error in /api/portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}
