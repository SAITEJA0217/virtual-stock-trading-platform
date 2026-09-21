'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PortfolioHoldingItem } from '@/lib/types';
import { formatINR, formatPercent } from '@/lib/formatters';
import { PieChart as PieIcon, Briefcase } from 'lucide-react';
import Link from 'next/link';

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

export function AllocationChart({
  holdings,
  cashBalance,
  isLoading,
}: {
  holdings: PortfolioHoldingItem[];
  cashBalance: number;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-[#111827]/90 border border-gray-800 h-80 animate-pulse" />
    );
  }

  const chartData = holdings.map((h) => ({
    name: h.symbol,
    value: h.currentValue,
    sector: h.sector,
    quantity: h.quantity,
  }));

  // Include cash as a slice
  if (cashBalance > 0) {
    chartData.push({
      name: 'Cash',
      value: cashBalance,
      sector: 'Liquid Funds',
      quantity: 0,
    });
  }

  const totalValue = chartData.reduce((acc, item) => acc + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pct = totalValue > 0 ? (data.value / totalValue) * 100 : 0;
      return (
        <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl shadow-xl text-xs space-y-1">
          <div className="font-bold text-white flex items-center justify-between gap-4">
            <span>{data.name}</span>
            <span className="text-blue-400">{formatPercent(pct)}</span>
          </div>
          <div className="text-gray-400">{data.sector}</div>
          <div className="text-emerald-400 font-semibold">{formatINR(data.value)}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 rounded-2xl bg-[#111827]/90 border border-gray-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center">
            <PieIcon className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="font-bold text-white text-sm">Portfolio Asset Allocation</h3>
        </div>
        <Link
          href="/portfolio"
          className="text-xs text-blue-400 hover:text-blue-300 font-medium transition"
        >
          Manage
        </Link>
      </div>

      {holdings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-300">Portfolio is currently 100% Cash</p>
            <p className="text-xs text-gray-500 max-w-xs">
              Explore the Market tab and buy Indian blue-chip stocks to build your simulated equity portfolio.
            </p>
          </div>
          <Link
            href="/market"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md shadow-blue-600/20"
          >
            Explore Market Stocks
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === 'Cash' ? '#4B5563' : COLORS[index % COLORS.length]}
                      stroke="#111827"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {chartData.map((item, idx) => {
              const pct = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-gray-800/40 transition"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          item.name === 'Cash' ? '#4B5563' : COLORS[idx % COLORS.length],
                      }}
                    />
                    <span className="font-semibold text-gray-200">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-300 font-medium">{formatINR(item.value)}</span>
                    <span className="text-gray-500 ml-2 font-mono">({formatPercent(pct, 1)})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
