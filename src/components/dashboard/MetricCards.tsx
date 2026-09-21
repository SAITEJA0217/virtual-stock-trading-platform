'use client';

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { formatINR, formatPercent } from '@/lib/formatters';
import {
  Wallet,
  TrendingUp,
  PieChart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export function MetricCards() {
  const { userSummary, isLoadingUser } = useSimulation();

  if (isLoadingUser || !userSummary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-gray-900/60 border border-gray-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const isTotalPLPositive = userSummary.totalPL >= 0;
  const isUnrealizedPositive = userSummary.unrealizedPL >= 0;
  const isRealizedPositive = userSummary.realizedPL >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Account / Portfolio Value */}
      <div className="p-5 rounded-2xl bg-[#111827]/90 border border-gray-800 hover:border-gray-700 transition shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">Total Account Value</span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <PieChart className="w-4 h-4 text-blue-400" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {formatINR(userSummary.totalAccountValue)}
          </div>
          <div className="text-[11px] text-gray-400">
            Cash ({formatINR(userSummary.cashBalance)}) + Holdings ({formatINR(userSummary.currentPortfolioValue)})
          </div>
        </div>
      </div>

      {/* 2. Available Cash */}
      <div className="p-5 rounded-2xl bg-[#111827]/90 border border-gray-800 hover:border-gray-700 transition shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">Available Virtual Cash</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">
            {formatINR(userSummary.cashBalance)}
          </div>
          <div className="text-[11px] text-gray-400">
            Ready for instant simulated execution
          </div>
        </div>
      </div>

      {/* 3. Invested Value */}
      <div className="p-5 rounded-2xl bg-[#111827]/90 border border-gray-800 hover:border-gray-700 transition shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">Invested Capital</span>
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {formatINR(userSummary.investedValue)}
          </div>
          <div className="text-[11px] text-gray-400">
            Across {userSummary.holdingsCount} active {userSummary.holdingsCount === 1 ? 'position' : 'positions'}
          </div>
        </div>
      </div>

      {/* 4. Total P/L */}
      <div className="p-5 rounded-2xl bg-[#111827]/90 border border-gray-800 hover:border-gray-700 transition shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">Overall Profit / Loss</span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isTotalPLPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}
          >
            {isTotalPLPositive ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
          </div>
        </div>
        <div className="space-y-1">
          <div
            className={`text-2xl font-extrabold tracking-tight ${
              isTotalPLPositive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {isTotalPLPositive ? '+' : ''}
            {formatINR(userSummary.totalPL)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5 border-t border-gray-800/80">
            <span>
              Unrealized:{' '}
              <strong className={isUnrealizedPositive ? 'text-emerald-400' : 'text-red-400'}>
                {isUnrealizedPositive ? '+' : ''}
                {formatINR(userSummary.unrealizedPL)}
              </strong>
            </span>
            <span>
              Realized:{' '}
              <strong className={isRealizedPositive ? 'text-emerald-400' : 'text-red-400'}>
                {isRealizedPositive ? '+' : ''}
                {formatINR(userSummary.realizedPL)}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
