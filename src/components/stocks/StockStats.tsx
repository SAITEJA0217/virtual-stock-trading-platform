'use client';

import React from 'react';
import { StockItem } from '@/lib/types';
import { formatINR, formatVolume, formatPercent } from '@/lib/formatters';
import { Building2, Layers, BarChart3, Activity } from 'lucide-react';

interface StockStatsProps {
  stock: StockItem & { dayHigh?: number; dayLow?: number; dayVolume?: number };
}

export function StockStats({ stock }: StockStatsProps) {
  const dayHigh = stock.dayHigh ?? stock.highPrice;
  const dayLow = stock.dayLow ?? stock.lowPrice;
  const dayRange = dayHigh - dayLow;
  const currentPos = dayRange > 0 ? ((stock.currentPrice - dayLow) / dayRange) * 100 : 50;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#111827]/90 border border-gray-800 shadow-sm space-y-6">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Activity className="w-4 h-4 text-blue-400" />
        <span>Market Statistics & Session Metrics</span>
      </h3>

      {/* Day's Range Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Day Low: <strong className="text-white">{formatINR(dayLow)}</strong></span>
          <span className="text-xs font-semibold text-gray-300">Intraday Range</span>
          <span className="text-gray-400">Day High: <strong className="text-white">{formatINR(dayHigh)}</strong></span>
        </div>
        <div className="w-full h-2 bg-gray-900 rounded-full relative overflow-hidden border border-gray-800">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 rounded-full"
            style={{ width: '100%' }}
          />
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-white border border-gray-900 rounded-full shadow-md"
            style={{ left: `${Math.min(99, Math.max(1, currentPos))}%` }}
          />
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/80 space-y-1">
          <span className="text-gray-400">Open Price</span>
          <div className="text-sm font-bold text-white font-mono">{formatINR(stock.openPrice)}</div>
        </div>

        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/80 space-y-1">
          <span className="text-gray-400">High Price (Candle)</span>
          <div className="text-sm font-bold text-emerald-400 font-mono">{formatINR(stock.highPrice)}</div>
        </div>

        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/80 space-y-1">
          <span className="text-gray-400">Low Price (Candle)</span>
          <div className="text-sm font-bold text-red-400 font-mono">{formatINR(stock.lowPrice)}</div>
        </div>

        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/80 space-y-1">
          <span className="text-gray-400">Previous Close</span>
          <div className="text-sm font-bold text-gray-300 font-mono">{formatINR(stock.previousClose)}</div>
        </div>

        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/80 space-y-1">
          <span className="text-gray-400">Candle Volume</span>
          <div className="text-sm font-bold text-white font-mono">{stock.volume.toLocaleString('en-IN')}</div>
        </div>

        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/80 space-y-1">
          <span className="text-gray-400">Total Day Volume</span>
          <div className="text-sm font-bold text-blue-400 font-mono">
            {formatVolume(stock.dayVolume ?? stock.volume)}
          </div>
        </div>
      </div>

      {/* Company info */}
      <div className="pt-4 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-500" />
          <span>Sector: <strong className="text-gray-200">{stock.sector}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-500" />
          <span>Simulated Exchange: <strong className="text-gray-200">NSE / BSE Virtual</strong></span>
        </div>
      </div>
    </div>
  );
}
