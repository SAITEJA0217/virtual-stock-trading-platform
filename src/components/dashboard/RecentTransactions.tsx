'use client';

import React from 'react';
import Link from 'next/link';
import { TransactionItem } from '@/lib/types';
import { formatINR, formatDateTimeDisplay } from '@/lib/formatters';
import { History, ArrowRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function RecentTransactions({
  transactions,
  isLoading,
}: {
  transactions: TransactionItem[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-[#111827]/90 border border-gray-800 h-64 animate-pulse" />
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-[#111827]/90 border border-gray-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
            <History className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="font-bold text-white text-sm">Recent Trading Activity</h3>
        </div>
        <Link
          href="/transactions"
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <p className="text-xs text-gray-400">No trading activity recorded yet.</p>
          <p className="text-[11px] text-gray-500">
            Execute your first buy trade on the Market page to build your ledger.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="pb-2.5 font-medium">Type</th>
                <th className="pb-2.5 font-medium">Stock</th>
                <th className="pb-2.5 font-medium text-right">Quantity</th>
                <th className="pb-2.5 font-medium text-right">Execution Price</th>
                <th className="pb-2.5 font-medium text-right">Total Amount</th>
                <th className="pb-2.5 font-medium text-right">Simulated Date/Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {transactions.slice(0, 5).map((t) => (
                <tr key={t.id} className="hover:bg-gray-800/30 transition">
                  <td className="py-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        t.type === 'BUY'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/15 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {t.type === 'BUY' ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {t.type}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <Link
                      href={`/stocks/${t.symbol}`}
                      className="font-bold text-white hover:text-blue-400 transition"
                    >
                      {t.symbol}
                    </Link>
                  </td>
                  <td className="py-2.5 text-right font-mono text-gray-200">
                    {t.quantity}
                  </td>
                  <td className="py-2.5 text-right font-mono text-gray-200">
                    {formatINR(t.price)}
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold text-white">
                    {formatINR(t.totalAmount)}
                  </td>
                  <td className="py-2.5 text-right text-gray-400">
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
