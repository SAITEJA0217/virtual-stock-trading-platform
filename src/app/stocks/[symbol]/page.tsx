'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSimulation } from '@/context/SimulationContext';
import { StockChart } from '@/components/stocks/StockChart';
import { StockStats } from '@/components/stocks/StockStats';
import { StockItem } from '@/lib/types';
import { formatINR, formatPercent, formatDateTimeDisplay } from '@/lib/formatters';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  DollarSign,
  Info,
} from 'lucide-react';

export default function StockDetailPage() {
  const params = useParams();
  const rawSymbol = params.symbol as string;
  const symbol = rawSymbol?.toUpperCase();

  const { currentTimestamp, openBuyModal, openSellModal } = useSimulation();

  const [stock, setStock] = useState<(StockItem & { dayHigh?: number; dayLow?: number; dayVolume?: number }) | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStock() {
      if (!symbol) return;
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(
          `/api/stocks/${symbol}?timestamp=${encodeURIComponent(currentTimestamp)}`
        );
        if (!res.ok) {
          throw new Error(`Stock ${symbol} not found`);
        }
        const data = await res.json();
        setStock(data.stock);
      } catch (err: any) {
        setError(err.message || 'Failed to load stock data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStock();
  }, [symbol, currentTimestamp]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-gray-900/60 rounded-2xl animate-pulse" />
        <div className="h-96 bg-gray-900/60 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="p-12 text-center rounded-2xl bg-[#111827] border border-gray-800 space-y-4">
        <h2 className="text-xl font-bold text-white">Stock Not Found</h2>
        <p className="text-xs text-gray-400">{error || `Symbol ${symbol} does not exist.`}</p>
        <Link
          href="/market"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Market</span>
        </Link>
      </div>
    );
  }

  const isPositive = stock.priceChange >= 0;

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Link href="/market" className="hover:text-white flex items-center gap-1 transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Market</span>
        </Link>
        <span>/</span>
        <span className="text-gray-200 font-semibold">{stock.symbol}</span>
      </div>

      {/* Stock Header Banner with Live Price & Trade Action Buttons */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#111827]/90 border border-gray-800 shadow-sm">
        {/* Left: Metadata & Price */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {stock.symbol}
            </h1>
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-700">
              {stock.sector}
            </span>
          </div>
          <p className="text-xs text-gray-400">{stock.name}</p>

          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {formatINR(stock.currentPrice)}
            </span>
            <div
              className={`flex items-center gap-1 text-sm font-bold ${
                isPositive ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span>{isPositive ? '+' : ''}{formatINR(stock.priceChange)}</span>
              <span>({formatPercent(stock.priceChangePercent)})</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Trade Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => openBuyModal(stock)}
            className="flex-1 md:flex-initial px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>BUY {stock.symbol}</span>
          </button>
          <button
            onClick={() => openSellModal(stock)}
            className="flex-1 md:flex-initial px-6 py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            <DollarSign className="w-4 h-4" />
            <span>SELL {stock.symbol}</span>
          </button>
        </div>
      </div>

      {/* Interactive Stock Historical Chart (1D, 5D, 10D, 15D) */}
      <StockChart
        symbol={stock.symbol}
        currentTimestamp={currentTimestamp}
        currentPrice={stock.currentPrice}
      />

      {/* Stock Metrics & Session Details */}
      <StockStats stock={stock} />
    </div>
  );
}
