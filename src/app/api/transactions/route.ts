import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const symbol = searchParams.get('symbol')?.toUpperCase();
    const date = searchParams.get('date');

    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ transactions: [] });
    }

    const whereClause: any = {
      userId: user.id,
    };

    if (type && type !== 'ALL') {
      whereClause.type = type.toUpperCase();
    }

    if (symbol && symbol !== 'ALL') {
      whereClause.stock = {
        symbol,
      };
    }

    if (date) {
      const startDate = new Date(`${date}T00:00:00.000Z`);
      const endDate = new Date(`${date}T23:59:59.999Z`);
      whereClause.timestamp = {
        gte: startDate,
        lte: endDate,
      };
    }

    const rawTransactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        stock: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    const transactions = rawTransactions.map((t) => ({
      id: t.id,
      userId: t.userId,
      stockId: t.stockId,
      symbol: t.stock.symbol,
      name: t.stock.name,
      sector: t.stock.sector,
      type: t.type as 'BUY' | 'SELL',
      quantity: t.quantity,
      price: Number(t.price.toFixed(2)),
      totalAmount: Number(t.totalAmount.toFixed(2)),
      timestamp: t.timestamp.toISOString(),
    }));

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('API Error in /api/transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
