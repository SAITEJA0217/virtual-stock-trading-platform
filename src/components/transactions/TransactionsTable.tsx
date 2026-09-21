'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TransactionItem } from '@/lib/types';
import { formatINR, formatDateTimeDisplay } from '@/lib/formatters';
import {
  History,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
} from 'lucide-react';

export function TransactionsTable({
  transactions,
  isLoading,
}: {
  transactions: TransactionItem[];
  isLoading: boolean;
}) {
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  const symbols = ['ALL', ...Array.from(new Set(transactions.map((t) => t.symbol))).sort()];

  const filtered = transactions.filter((t) => {
    const matchType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchSymbol = selectedSymbol === 'ALL' || t.symbol === selectedSymbol;
    const matchDate = !dateFilter || t.timestamp.startsWith(dateFilter);
    return matchType && matchSymbol && matchDate;
  });

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-[#111827]/90 border border-gray-800 space-y-4 animate-pulse">
        <div className="h-10 bg-gray-900 rounded-xl" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-900/60 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#111827]/90 border border-gray-800 shadow-sm space-y-5">
      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Type Toggle */}
        <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 p-1 rounded-xl">
          {(['ALL', 'BUY', 'SELL'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                typeFilter === type
                  ? type === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : type === 'SELL'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Symbol & Date Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Stock Filter */}
          <div className="relative">
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Stocks</option>
              {symbols.filter((s) => s !== 'ALL').map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative flex items-center">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="ml-1 text-xs text-gray-400 hover:text-white px-1.5 py-1 rounded bg-gray-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <History className="w-10 h-10 text-gray-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-300">No transactions found</p>
          <p className="text-xs text-gray-500">
            No trades match the current filter criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs">
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Stock</th>
                <th className="pb-3 font-semibold text-right">Shares</th>
                <th className="pb-3 font-semibold text-right">Execution Price</th>
                <th className="pb-3 font-semibold text-right">Total Trade Value</th>
                <th className="pb-3 font-semibold text-right">Simulated Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-800/40 transition">
                  {/* Order Type */}
                  <td className="py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        t.type === 'BUY'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/15 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {t.type === 'BUY' ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      {t.type}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="py-3.5">
                    <Link
                      href={`/stocks/${t.symbol}`}
                      className="block group hover:text-blue-400 transition"
                    >
                      <div className="font-bold text-white group-hover:text-blue-400 transition">
                        {t.symbol}
                      </div>
                      <div className="text-xs text-gray-400">{t.name}</div>
                    </Link>
                  </td>

                  {/* Quantity */}
                  <td className="py-3.5 text-right font-mono font-bold text-gray-200">
                    {t.quantity}
                  </td>

                  {/* Price */}
                  <td className="py-3.5 text-right font-mono text-gray-300">
                    {formatINR(t.price)}
                  </td>

                  {/* Total Value */}
                  <td className="py-3.5 text-right font-mono font-bold text-white text-base">
                    {formatINR(t.totalAmount)}
                  </td>

                  {/* Timestamp */}
                  <td className="py-3.5 text-right text-xs text-gray-400 font-mono">
                    {formatDateTimeDisplay(t.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
