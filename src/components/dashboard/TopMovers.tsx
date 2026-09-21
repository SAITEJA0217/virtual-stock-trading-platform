'use client';

import React from 'react';
import Link from 'next/link';
import { StockItem } from '@/lib/types';
import { useSimulation } from '@/context/SimulationContext';
import { formatINR, formatPercent } from '@/lib/formatters';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

export function TopMovers({ stocks, isLoading }: { stocks: StockItem[]; isLoading: boolean }) {
  const { openBuyModal } = useSimulation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-64 rounded-2xl bg-gray-900/60 border border-gray-800 animate-pulse" />
        <div className="h-64 rounded-2xl bg-gray-900/60 border border-gray-800 animate-pulse" />
      </div>
    );
  }

  const sortedByChange = [...stocks].sort(
    (a, b) => b.priceChangePercent - a.priceChangePercent
  );

  const gainers = sortedByChange.slice(0, 3);
  const losers = [...sortedByChange].reverse().slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Top Gainers */}
      <div className="p-5 rounded-2xl bg-[#111827]/90 border border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-bold text-white text-sm">Top Gainers</h3>
          </div>
          <Link
            href="/market"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {gainers.map((stock) => (
            <div
              key={stock.symbol}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800/80 transition"
            >
              <Link href={`/stocks/${stock.symbol}`} className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{stock.symbol}</span>
                  <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{stock.name}</span>
                </div>
                <div className="text-xs font-semibold text-gray-200 mt-0.5">
                  {formatINR(stock.currentPrice)}
                </div>
              </Link>

              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    {formatPercent(stock.priceChangePercent)}
                  </span>
                  <div className="text-[10px] text-emerald-400 mt-0.5">
                    +{formatINR(stock.priceChange)}
                  </div>
                </div>

                <button
                  onClick={() => openBuyModal(stock)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition"
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Losers */}
      <div className="p-5 rounded-2xl bg-[#111827]/90 border border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="font-bold text-white text-sm">Top Losers / Dips</h3>
          </div>
          <Link
            href="/market"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {losers.map((stock) => (
            <div
              key={stock.symbol}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800/80 transition"
            >
              <Link href={`/stocks/${stock.symbol}`} className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{stock.symbol}</span>
                  <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{stock.name}</span>
                </div>
                <div className="text-xs font-semibold text-gray-200 mt-0.5">
                  {formatINR(stock.currentPrice)}
                </div>
              </Link>

              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/20">
                    {formatPercent(stock.priceChangePercent)}
                  </span>
                  <div className="text-[10px] text-red-400 mt-0.5">
                    {formatINR(stock.priceChange)}
                  </div>
                </div>

                <button
                  onClick={() => openBuyModal(stock)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition"
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
