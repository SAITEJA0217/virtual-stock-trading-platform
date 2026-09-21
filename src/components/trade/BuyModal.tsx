'use client';

import React, { useState, useEffect } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { formatINR, formatDateTimeDisplay } from '@/lib/formatters';
import { X, TrendingUp, Wallet, AlertCircle, Loader2 } from 'lucide-react';

export function BuyModal() {
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedTradeStock) {
      setQuantity(1);
      setError(null);
    }
  }, [selectedTradeStock]);

  if (tradeModalType !== 'BUY' || !selectedTradeStock) {
    return null;
  }

  const price = selectedTradeStock.currentPrice;
  const availableCash = userSummary?.cashBalance || 0;
  const estimatedTotal = Number((quantity * price).toFixed(2));
  const remainingCash = Number((availableCash - estimatedTotal).toFixed(2));
  const maxAffordable = Math.floor(availableCash / price);
  const isInsufficientFunds = estimatedTotal > availableCash;

  const handleQuantityChange = (val: number) => {
    setError(null);
    const valid = Math.max(1, Math.floor(val || 1));
    setQuantity(valid);
  };

  const handleQuickAdd = (amount: number) => {
    setError(null);
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const handleSetMax = () => {
    setError(null);
    setQuantity(Math.max(1, maxAffordable));
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setError('Please enter a positive quantity');
      return;
    }
    if (isInsufficientFunds) {
      setError('Insufficient virtual cash balance for this trade');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch('/api/trade/buy', {
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
        throw new Error(data.error || 'Failed to execute buy order');
      }

      showToast(
        'success',
        'Buy Order Executed',
        `Bought ${quantity} shares of ${selectedTradeStock.symbol} at ${formatINR(data.data.tradePrice)} (Total: ${formatINR(data.data.totalCost)})`
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
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Buy {selectedTradeStock.symbol}</h3>
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
        <form onSubmit={handleBuy} className="p-6 space-y-5">
          {/* Price details banner */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-900/90 border border-gray-800">
            <div>
              <div className="text-xs text-gray-400">Simulated Price</div>
              <div className="text-xl font-bold text-emerald-400">{formatINR(price)}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-gray-400">Market Timestamp</div>
              <div className="text-xs font-medium text-gray-300">
                {formatDateTimeDisplay(currentTimestamp)}
              </div>
            </div>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-gray-300">Quantity (Shares)</label>
              <span className="text-gray-400">
                Max affordable: <strong className="text-white">{maxAffordable}</strong>
              </span>
            </div>

            <input
              type="number"
              min="1"
              max={Math.max(1, maxAffordable)}
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
              className="w-full bg-gray-900 border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-white font-mono text-lg outline-none transition"
              required
            />

            {/* Quick Add Buttons */}
            <div className="flex items-center gap-2 pt-1">
              {[1, 5, 10, 25, 50].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => handleQuickAdd(step)}
                  className="flex-1 py-1 text-xs font-medium bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 rounded-lg transition"
                >
                  +{step}
                </button>
              ))}
              <button
                type="button"
                onClick={handleSetMax}
                disabled={maxAffordable <= 0}
                className="flex-1 py-1 text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 rounded-lg transition disabled:opacity-40"
              >
                Max
              </button>
            </div>
          </div>

          {/* Breakdown / Cost Summary */}
          <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-gray-400">
              <span>Estimated Order Total</span>
              <span className="font-semibold text-white text-sm">{formatINR(estimatedTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Available Cash Balance</span>
              <span className="text-gray-200">{formatINR(availableCash)}</span>
            </div>
            <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
              <span className="text-gray-400">Remaining Balance</span>
              <span
                className={`font-semibold ${
                  remainingCash >= 0 ? 'text-gray-300' : 'text-red-400'
                }`}
              >
                {formatINR(remainingCash)}
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
              disabled={isSubmitting || isInsufficientFunds || quantity <= 0}
              className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <span>BUY {quantity} {selectedTradeStock.symbol}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
