'use client';

import React, { useState, useEffect } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { formatINR, formatDateTimeDisplay, formatPercent } from '@/lib/formatters';
import { X, TrendingDown, AlertCircle, Loader2 } from 'lucide-react';

export function SellModal() {
  const {
    selectedTradeStock,
    tradeModalType,
    closeTradeModal,
    userSummary,
    currentTimestamp,
    refreshUserData,
    showToast,
  } = useSimulation();

  const [quantity, setQuantity] = useState<number>(1);
  const [ownedQuantity, setOwnedQuantity] = useState<number>(0);
  const [averageBuyPrice, setAverageBuyPrice] = useState<number>(0);
  const [isLoadingHolding, setIsLoadingHolding] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHolding() {
      if (!selectedTradeStock || tradeModalType !== 'SELL') return;
      try {
        setIsLoadingHolding(true);
        setError(null);
        const res = await fetch(`/api/portfolio?timestamp=${encodeURIComponent(currentTimestamp)}`);
        if (res.ok) {
          const data = await res.json();
          const holding = data.holdings?.find(
            (h: any) => h.symbol === selectedTradeStock.symbol
          );
          if (holding) {
            setOwnedQuantity(holding.quantity);
            setAverageBuyPrice(holding.averageBuyPrice);
            setQuantity(Math.min(1, holding.quantity));
          } else {
            setOwnedQuantity(0);
            setAverageBuyPrice(0);
            setQuantity(0);
          }
        }
      } catch (err) {
        console.error('Failed to fetch holding info:', err);
      } finally {
        setIsLoadingHolding(false);
      }
    }

    fetchHolding();
  }, [selectedTradeStock, tradeModalType, currentTimestamp]);

  if (tradeModalType !== 'SELL' || !selectedTradeStock) {
    return null;
  }

  const price = selectedTradeStock.currentPrice;
  const estimatedProceeds = Number((quantity * price).toFixed(2));
  const estimatedRealizedPL = Number(((price - averageBuyPrice) * quantity).toFixed(2));
  const realizedPLPercent =
    averageBuyPrice > 0 ? Number((((price - averageBuyPrice) / averageBuyPrice) * 100).toFixed(2)) : 0;
  const isInvalidQuantity = quantity <= 0 || quantity > ownedQuantity;

  const handlePercentageClick = (pct: number) => {
    setError(null);
    const shares = Math.max(1, Math.floor((ownedQuantity * pct) / 100));
    setQuantity(Math.min(shares, ownedQuantity));
  };

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setError('Please enter a positive quantity');
      return;
    }
    if (quantity > ownedQuantity) {
      setError(`Cannot sell more than owned (${ownedQuantity} shares)`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch('/api/trade/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedTradeStock.symbol,
          quantity,
          timestamp: currentTimestamp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to execute sell order');
      }

      showToast(
        'success',
        'Sell Order Executed',
        `Sold ${quantity} shares of ${selectedTradeStock.symbol} at ${formatINR(data.data.tradePrice)} (Proceeds: ${formatINR(data.data.proceeds)}, Realized P/L: ${data.data.realizedPL >= 0 ? '+' : ''}${formatINR(data.data.realizedPL)})`
      );

      await refreshUserData();
      closeTradeModal();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#0E131F]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sell {selectedTradeStock.symbol}</h3>
              <p className="text-xs text-gray-400">{selectedTradeStock.name}</p>
            </div>
          </div>
          <button
            onClick={closeTradeModal}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSell} className="p-6 space-y-5">
          {/* Price & Holding Snapshot */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gray-900/90 border border-gray-800">
              <div className="text-[11px] text-gray-400">Current Price</div>
              <div className="text-lg font-bold text-white">{formatINR(price)}</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-900/90 border border-gray-800">
              <div className="text-[11px] text-gray-400">Owned Shares</div>
              <div className="text-lg font-bold text-blue-400">
                {isLoadingHolding ? '...' : `${ownedQuantity} shares`}
              </div>
            </div>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-gray-300">Quantity to Sell</label>
              <span className="text-gray-400">
                Avg Buy Price: <strong className="text-gray-200">{formatINR(averageBuyPrice)}</strong>
              </span>
            </div>

            <input
              type="number"
              min="1"
              max={ownedQuantity}
              value={quantity || ''}
              onChange={(e) => {
                setError(null);
                setQuantity(parseInt(e.target.value, 10) || 0);
              }}
              disabled={ownedQuantity <= 0}
              className="w-full bg-gray-900 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl px-4 py-2.5 text-white font-mono text-lg outline-none transition disabled:opacity-50"
              required
            />

            {/* Quick Percentage Buttons */}
            <div className="flex items-center gap-2 pt-1">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentageClick(pct)}
                  disabled={ownedQuantity <= 0}
                  className="flex-1 py-1 text-xs font-semibold bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 rounded-lg transition disabled:opacity-40"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Proceeds and Realized P/L */}
          <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-gray-400">
              <span>Estimated Proceeds</span>
              <span className="font-semibold text-white text-sm">{formatINR(estimatedProceeds)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Estimated Realized P/L</span>
              <span
                className={`font-semibold ${
                  estimatedRealizedPL >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {estimatedRealizedPL >= 0 ? '+' : ''}
                {formatINR(estimatedRealizedPL)} ({formatPercent(realizedPLPercent)})
              </span>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={closeTradeModal}
              disabled={isSubmitting}
              className="w-1/3 py-2.5 rounded-xl border border-gray-700 hover:bg-gray-800 text-gray-300 font-medium text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isInvalidQuantity || ownedQuantity <= 0}
              className="w-2/3 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Selling...</span>
                </>
              ) : (
                <span>SELL {quantity} {selectedTradeStock.symbol}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
