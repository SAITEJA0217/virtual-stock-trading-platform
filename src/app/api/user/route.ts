import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSimulationTargetDate, getStockPriceAtTimestamp } from '@/lib/market-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timestampParam = searchParams.get('timestamp');
    const targetTimestamp = await getSimulationTargetDate(timestampParam);

    let user = await prisma.user.findFirst({
      include: {
        holdings: {
          include: {
            stock: true,
          },
        },
        transactions: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Demo Trader',
          cashBalance: 1000000.0,
        },
        include: {
          holdings: {
            include: {
              stock: true,
            },
          },
          transactions: true,
        },
      });
    }

    // Calculate Current Portfolio Value and Unrealized P/L
    let investedValue = 0;
    let currentPortfolioValue = 0;

    for (const holding of user.holdings) {
      if (holding.quantity > 0) {
        investedValue += holding.quantity * holding.averageBuyPrice;
        const priceInfo = await getStockPriceAtTimestamp(holding.stockId, targetTimestamp);
        const currentPrice = priceInfo ? priceInfo.record.close : holding.averageBuyPrice;
        currentPortfolioValue += holding.quantity * currentPrice;
      }
    }

    const unrealizedPL = Number((currentPortfolioValue - investedValue).toFixed(2));
    const unrealizedPLPercent =
      investedValue > 0 ? Number(((unrealizedPL / investedValue) * 100).toFixed(2)) : 0;

    const startingCapital = 1000000.0;
    const totalAccountValue = Number((user.cashBalance + currentPortfolioValue).toFixed(2));
    const totalPL = Number((totalAccountValue - startingCapital).toFixed(2));
    const realizedPL = Number((totalPL - unrealizedPL).toFixed(2));

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        cashBalance: Number(user.cashBalance.toFixed(2)),
        investedValue: Number(investedValue.toFixed(2)),
        currentPortfolioValue: Number(currentPortfolioValue.toFixed(2)),
        totalAccountValue,
        unrealizedPL,
        unrealizedPLPercent,
        realizedPL,
        totalPL,
        holdingsCount: user.holdings.filter((h) => h.quantity > 0).length,
      },
    });
  } catch (error) {
    console.error('API Error in /api/user:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}
