'use client';

import React from 'react';
import Link from 'next/link';
import { PortfolioHoldingItem, StockItem } from '@/lib/types';
import { useSimulation } from '@/context/SimulationContext';
import { formatINR, formatPercent } from '@/lib/formatters';
import { ArrowUpRight, ArrowDownRight, Briefcase } from 'lucide-react';

export function HoldingsTable({
  holdings,
  isLoading,
}: {
  holdings: PortfolioHoldingItem[];
  isLoading: boolean;
}) {
  const { openBuyModal, openSellModal } = useSimulation();

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-[#111827]/90 border border-gray-800 space-y-3 animate-pulse">
        <div className="h-8 bg-gray-900 rounded-lg w-1/4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-900/60 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-[#111827]/90 border border-gray-800 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto text-gray-500">
          <Briefcase className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Your Portfolio is Empty</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            You currently hold no active stock positions. Visit the market page to invest your ₹10,00,000 virtual balance.
          </p>
        </div>
        <Link
          href="/market"
          className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition"
        >
          View Market Stocks
        </Link>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#111827]/90 border border-gray-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Active Equity Holdings ({holdings.length})</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs">
              <th className="pb-3 font-semibold">Stock / Symbol</th>
              <th className="pb-3 font-semibold text-right">Shares</th>
              <th className="pb-3 font-semibold text-right">Avg. Buy Price</th>
              <th className="pb-3 font-semibold text-right">Current Price</th>
              <th className="pb-3 font-semibold text-right">Invested Value</th>
              <th className="pb-3 font-semibold text-right">Current Value</th>
              <th className="pb-3 font-semibold text-right">Unrealized P/L</th>
              <th className="pb-3 font-semibold text-right">Allocation</th>
              <th className="pb-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {holdings.map((h) => {
              const isProfit = h.unrealizedPL >= 0;
              const stockForModal: StockItem = {
                id: h.stockId,
                symbol: h.symbol,
                name: h.name,
                sector: h.sector,
                currentPrice: h.currentPrice,
                openPrice: h.currentPrice,
                highPrice: h.currentPrice,
                lowPrice: h.currentPrice,
                previousClose: h.averageBuyPrice,
                priceChange: h.currentPrice - h.averageBuyPrice,
                priceChangePercent: h.unrealizedPLPercent,
                volume: 0,
                timestamp: '',
                isExactMatch: true,
              };

              return (
                <tr key={h.id} className="hover:bg-gray-800/40 transition group">
                  {/* Symbol & Name */}
                  <td className="py-3.5">
                    <Link
                      href={`/stocks/${h.symbol}`}
                      className="block group-hover:text-blue-400 transition"
                    >
                      <div className="font-bold text-white group-hover:text-blue-400 transition">
                        {h.symbol}
                      </div>
                      <div className="text-xs text-gray-400">{h.name}</div>
                    </Link>
                  </td>

                  {/* Quantity */}
                  <td className="py-3.5 text-right font-mono font-bold text-gray-200">
                    {h.quantity}
                  </td>

                  {/* Average Buy Price */}
                  <td className="py-3.5 text-right font-mono text-gray-300">
                    {formatINR(h.averageBuyPrice)}
                  </td>

                  {/* Current Simulated Price */}
                  <td className="py-3.5 text-right font-mono font-bold text-white">
                    {formatINR(h.currentPrice)}
                  </td>

                  {/* Invested Amount */}
                  <td className="py-3.5 text-right font-mono text-gray-300">
                    {formatINR(h.investedAmount)}
                  </td>

                  {/* Current Value */}
                  <td className="py-3.5 text-right font-mono font-bold text-white">
                    {formatINR(h.currentValue)}
                  </td>

                  {/* Unrealized P/L */}
                  <td className="py-3.5 text-right">
                    <div
                      className={`inline-flex items-center gap-1 font-bold text-xs ${
                        isProfit ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isProfit ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      <span>{isProfit ? '+' : ''}{formatINR(h.unrealizedPL)}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono">
                      ({formatPercent(h.unrealizedPLPercent)})
                    </div>
                  </td>

                  {/* Allocation % */}
                  <td className="py-3.5 text-right font-mono text-xs text-blue-400">
                    {formatPercent(h.allocationPercent, 1)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openBuyModal(stockForModal)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                      >
                        Buy +
                      </button>
                      <button
                        onClick={() => openSellModal(stockForModal)}
                        className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold transition"
                      >
                        Sell
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
