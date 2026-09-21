import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSimulationTargetDate, getStockPriceAtTimestamp } from '@/lib/market-service';
import { calculateRealizedPL } from '@/lib/calculations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, quantity: rawQuantity, timestamp: rawTimestamp } = body;

    const quantity = parseInt(rawQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be a positive integer' }, { status: 400 });
    }

    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json({ error: 'Stock symbol is required' }, { status: 400 });
    }

    const targetTimestamp = await getSimulationTargetDate(rawTimestamp);

    // Fetch stock
    const stock = await prisma.stock.findUnique({
      where: { symbol: symbol.toUpperCase() },
    });

    if (!stock) {
      return NextResponse.json({ error: `Stock ${symbol} not found` }, { status: 404 });
    }

    // Retrieve EXACT simulated price from database
    const priceData = await getStockPriceAtTimestamp(stock.id, targetTimestamp);
    if (!priceData || !priceData.record) {
      return NextResponse.json({ error: 'No market price available for this stock at the selected time' }, { status: 400 });
    }

    const tradePrice = priceData.record.close;
    const proceeds = Number((quantity * tradePrice).toFixed(2));

    // Execute atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst();
      if (!user) {
        throw new Error('User not found');
      }

      const holding = await tx.portfolioHolding.findUnique({
        where: {
          userId_stockId: {
            userId: user.id,
            stockId: stock.id,
          },
        },
      });

      if (!holding || holding.quantity < quantity) {
        throw new Error(
          `Insufficient shares to sell. You own ${holding ? holding.quantity : 0} shares of ${stock.symbol}, but attempted to sell ${quantity}`
        );
      }

      const realizedPL = calculateRealizedPL(tradePrice, holding.averageBuyPrice, quantity);

      // Increase cash balance
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          cashBalance: Number((user.cashBalance + proceeds).toFixed(2)),
        },
      });

      // Update or delete holding
      const remainingQty = holding.quantity - quantity;
      let updatedHolding = null;

      if (remainingQty === 0) {
        await tx.portfolioHolding.delete({
          where: { id: holding.id },
        });
      } else {
        updatedHolding = await tx.portfolioHolding.update({
          where: { id: holding.id },
          data: {
            quantity: remainingQty,
          },
        });
      }

      // Record transaction
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          stockId: stock.id,
          type: 'SELL',
          quantity: quantity,
          price: tradePrice,
          totalAmount: proceeds,
          timestamp: targetTimestamp,
        },
      });

      return {
        user: updatedUser,
        holding: updatedHolding,
        transaction,
        tradePrice,
        proceeds,
        realizedPL,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully sold ${quantity} shares of ${stock.symbol} @ ₹${result.tradePrice.toFixed(2)} (Realized P/L: ${result.realizedPL >= 0 ? '+' : ''}₹${result.realizedPL.toFixed(2)})`,
      data: result,
    });
  } catch (error: any) {
    console.error('Sell Trade Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute sell trade' },
      { status: 400 }
    );
  }
}
