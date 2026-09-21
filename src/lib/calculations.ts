/**
 * P/L and financial calculations
 */

/**
 * Weighted average buy price when acquiring additional shares
 * newAverage = (existingQty * existingAvg + newQty * newPrice) / (existingQty + newQty)
 */
export function calculateWeightedAverageBuyPrice(
  existingQty: number,
  existingAvg: number,
  newQty: number,
  newPrice: number
): number {
  const totalQty = existingQty + newQty;
  if (totalQty <= 0) return 0;
  const totalCost = existingQty * existingAvg + newQty * newPrice;
  return Number((totalCost / totalQty).toFixed(2));
}

/**
 * Unrealized P/L for a holding
 * unrealizedPL = (currentPrice - averageBuyPrice) * quantity
 */
export function calculateUnrealizedPL(
  currentPrice: number,
  averageBuyPrice: number,
  quantity: number
): { amount: number; percent: number } {
  const amount = Number(((currentPrice - averageBuyPrice) * quantity).toFixed(2));
  const invested = averageBuyPrice * quantity;
  const percent = invested > 0 ? Number(((amount / invested) * 100).toFixed(2)) : 0;
  return { amount, percent };
}

/**
 * Realized P/L from a sell trade
 * realizedPL = (sellPrice - averageBuyPrice) * soldQuantity
 */
export function calculateRealizedPL(
  sellPrice: number,
  averageBuyPrice: number,
  soldQuantity: number
): number {
  return Number(((sellPrice - averageBuyPrice) * soldQuantity).toFixed(2));
}

/**
 * Price change and change percentage relative to previous interval
 */
export function calculatePriceChange(
  currentClose: number,
  previousClose: number
): { change: number; changePercent: number } {
  if (!previousClose || previousClose === 0) {
    return { change: 0, changePercent: 0 };
  }
  const change = Number((currentClose - previousClose).toFixed(2));
  const changePercent = Number(((change / previousClose) * 100).toFixed(2));
  return { change, changePercent };
}
