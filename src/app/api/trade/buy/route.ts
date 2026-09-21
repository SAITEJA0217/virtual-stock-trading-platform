import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSimulationTargetDate, getStockPriceAtTimestamp } from '@/lib/market-service';
import { calculateWeightedAverageBuyPrice } from '@/lib/calculations';

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
    const totalCost = Number((quantity * tradePrice).toFixed(2));

    // Execute atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      let user = await tx.user.findFirst();
      if (!user) {
        user = await tx.user.create({
          data: { name: 'Demo Trader', cashBalance: 1000000.0 },
        });
      }

      if (user.cashBalance < totalCost) {
        throw new Error(`Insufficient funds. Required ₹${totalCost.toLocaleString('en-IN')}, available ₹${user.cashBalance.toLocaleString('en-IN')}`);
      }

      // Deduct cash balance
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          cashBalance: Number((user.cashBalance - totalCost).toFixed(2)),
        },
      });

      // Update or create holding
      const existingHolding = await tx.portfolioHolding.findUnique({
        where: {
          userId_stockId: {
            userId: user.id,
            stockId: stock.id,
          },
        },
      });

      let updatedHolding;
      if (existingHolding && existingHolding.quantity > 0) {
        const newAvg = calculateWeightedAverageBuyPrice(
          existingHolding.quantity,
          existingHolding.averageBuyPrice,
          quantity,
          tradePrice
        );
        updatedHolding = await tx.portfolioHolding.update({
          where: { id: existingHolding.id },
          data: {
            quantity: existingHolding.quantity + quantity,
            averageBuyPrice: newAvg,
          },
        });
      } else if (existingHolding) {
        updatedHolding = await tx.portfolioHolding.update({
          where: { id: existingHolding.id },
          data: {
            quantity: quantity,
            averageBuyPrice: tradePrice,
          },
        });
      } else {
        updatedHolding = await tx.portfolioHolding.create({
          data: {
            userId: user.id,
            stockId: stock.id,
            quantity: quantity,
            averageBuyPrice: tradePrice,
          },
        });
      }

      // Record transaction
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          stockId: stock.id,
          type: 'BUY',
          quantity: quantity,
          price: tradePrice,
          totalAmount: totalCost,
          timestamp: targetTimestamp,
        },
      });

      return {
        user: updatedUser,
        holding: updatedHolding,
        transaction,
        tradePrice,
        totalCost,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully bought ${quantity} shares of ${stock.symbol} @ ₹${result.tradePrice.toFixed(2)}`,
      data: result,
    });
  } catch (error: any) {
    console.error('Buy Trade Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute buy trade' },
      { status: 400 }
    );
  }
}
