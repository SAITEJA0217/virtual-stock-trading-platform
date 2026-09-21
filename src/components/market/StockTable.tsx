'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StockItem } from '@/lib/types';
import { useSimulation } from '@/context/SimulationContext';
import { formatINR, formatPercent, formatVolume } from '@/lib/formatters';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from 'lucide-react';

export function StockTable({
  stocks,
  isLoading,
}: {
  stocks: StockItem[];
  isLoading: boolean;
}) {
  const { openBuyModal, openSellModal } = useSimulation();
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'changePercent' | 'volume'>('symbol');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sectors = ['ALL', ...Array.from(new Set(stocks.map((s) => s.sector))).sort()];

  const handleSort = (field: 'symbol' | 'price' | 'changePercent' | 'volume') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredStocks = stocks
    .filter((stock) => {
      const matchSearch =
        stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
        stock.name.toLowerCase().includes(search.toLowerCase());
      const matchSector =
        selectedSector === 'ALL' || stock.sector === selectedSector;
      return matchSearch && matchSector;
    })
    .sort((a, b) => {
      let valA: any = a.symbol;
      let valB: any = b.symbol;

      if (sortBy === 'price') {
        valA = a.currentPrice;
        valB = b.currentPrice;
      } else if (sortBy === 'changePercent') {
        valA = a.priceChangePercent;
        valB = b.priceChangePercent;
      } else if (sortBy === 'volume') {
        valA = a.volume;
        valB = b.volume;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-[#111827]/90 border border-gray-800 space-y-4">
        <div className="h-10 w-full bg-gray-900 rounded-xl animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="h-12 bg-gray-900/60 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const hasFallbackMatch = stocks.some((s) => !s.isExactMatch);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#111827]/90 border border-gray-800 shadow-sm space-y-5">
      {/* Header controls: Search & Sector Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by stock name or symbol (e.g., TCS, Reliance)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 outline-none transition"
          />
        </div>

        {/* Sector Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {sectors.map((sector) => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedSector === sector
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-800'
              }`}
            >
              {sector}
            </button>
          ))}
        </div>
      </div>

      {/* Fallback indicator alert if exact timestamp doesn't exist */}
      {hasFallbackMatch && stocks[0] && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            Showing latest available market data record prior to requested timestamp: {stocks[0].timestamp.replace('T', ' ').substring(0, 16)}
          </span>
        </div>
      )}

      {/* Stocks Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs">
              <th
                onClick={() => handleSort('symbol')}
                className="pb-3 font-semibold cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Stock / Symbol</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="pb-3 font-semibold hidden sm:table-cell">Sector</th>
              <th
                onClick={() => handleSort('price')}
                className="pb-3 font-semibold text-right cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Simulated Price</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('changePercent')}
                className="pb-3 font-semibold text-right cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Change (30m)</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('volume')}
                className="pb-3 font-semibold text-right hidden md:table-cell cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Volume</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="pb-3 font-semibold text-right">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filteredStocks.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-500 text-sm">
                  No stocks match your query &quot;{search}&quot;.
                </td>
              </tr>
            ) : (
              filteredStocks.map((stock) => {
                const isPositive = stock.priceChange >= 0;
                return (
                  <tr
                    key={stock.symbol}
                    className="hover:bg-gray-800/40 transition group"
                  >
                    {/* Symbol & Name */}
                    <td className="py-3.5">
                      <Link
                        href={`/stocks/${stock.symbol}`}
                        className="block group-hover:text-blue-400 transition"
                      >
                        <div className="font-bold text-white group-hover:text-blue-400 transition">
                          {stock.symbol}
                        </div>
                        <div className="text-xs text-gray-400">{stock.name}</div>
                      </Link>
                    </td>

                    {/* Sector */}
                    <td className="py-3.5 hidden sm:table-cell">
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700/60">
                        {stock.sector}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 text-right font-mono font-bold text-white text-base">
                      {formatINR(stock.currentPrice)}
                    </td>

                    {/* Change & Change % */}
                    <td className="py-3.5 text-right">
                      <div
                        className={`inline-flex items-center gap-1 font-bold text-xs ${
                          isPositive ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>{formatPercent(stock.priceChangePercent)}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        {isPositive ? '+' : ''}
                        {formatINR(stock.priceChange)}
                      </div>
                    </td>

                    {/* Volume */}
                    <td className="py-3.5 text-right font-mono text-gray-300 text-xs hidden md:table-cell">
                      {formatVolume(stock.volume)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openBuyModal(stock)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition"
                        >
                          Buy
                        </button>
                        <button
                          onClick={() => openSellModal(stock)}
                          className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold transition"
                        >
                          Sell
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
