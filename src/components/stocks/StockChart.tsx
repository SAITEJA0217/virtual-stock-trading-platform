'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  ComposedChart,
} from 'recharts';
import { ChartCandle } from '@/lib/types';
import { formatINR, formatPercent } from '@/lib/formatters';
import { Loader2 } from 'lucide-react';

interface StockChartProps {
  symbol: string;
  currentTimestamp: string;
  currentPrice: number;
}

export function StockChart({ symbol, currentTimestamp, currentPrice }: StockChartProps) {
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '10D' | '15D'>('1D');
  const [candles, setCandles] = useState<ChartCandle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchChartData() {
      try {
        setIsLoading(true);
        const res = await fetch(
          `/api/market-data/${symbol}?timeframe=${timeframe}&timestamp=${encodeURIComponent(
            currentTimestamp
          )}`
        );
        if (res.ok) {
          const data = await res.json();
          setCandles(data.candles || []);
        }
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchChartData();
  }, [symbol, timeframe, currentTimestamp]);

  const minPrice = candles.length > 0 ? Math.min(...candles.map((c) => c.low)) : 0;
  const maxPrice = candles.length > 0 ? Math.max(...candles.map((c) => c.high)) : 0;
  const priceMargin = (maxPrice - minPrice) * 0.1 || 10;

  const firstCandle = candles[0];
  const lastCandle = candles[candles.length - 1];
  const isPositive =
    firstCandle && lastCandle ? lastCandle.close >= firstCandle.open : true;

  const strokeColor = isPositive ? '#10B981' : '#EF4444';
  const fillColor = isPositive ? '#10B981' : '#EF4444';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartCandle;
      return (
        <div className="p-3.5 bg-gray-950 border border-gray-800 rounded-xl shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
          <div className="font-semibold text-gray-300 border-b border-gray-800 pb-1 flex items-center justify-between gap-4">
            <span>{data.date}</span>
            <span className="font-mono text-gray-400">{data.time}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
            <span className="text-gray-400">Open:</span>
            <span className="text-white text-right">{formatINR(data.open)}</span>
            <span className="text-gray-400">High:</span>
            <span className="text-emerald-400 text-right">{formatINR(data.high)}</span>
            <span className="text-gray-400">Low:</span>
            <span className="text-red-400 text-right">{formatINR(data.low)}</span>
            <span className="text-gray-400 font-bold">Close:</span>
            <span className="text-white font-bold text-right">{formatINR(data.close)}</span>
            <span className="text-gray-400">Volume:</span>
            <span className="text-gray-300 text-right">{data.volume.toLocaleString('en-IN')}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#111827]/90 border border-gray-800 shadow-sm space-y-4">
      {/* Header with Timeframe Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">Simulated Historical Price Chart</h3>
          <p className="text-xs text-gray-400">Real-time database interval candle progression</p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 p-1 rounded-xl">
          {(['1D', '5D', '10D', '15D'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                timeframe === tf
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-80 w-full relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-[#111827]/60 backdrop-blur-xs flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        )}

        {candles.length === 0 && !isLoading ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            No historical records available for this interval.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={candles}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={fillColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={fillColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis
                dataKey={timeframe === '1D' ? 'time' : 'date'}
                stroke="#4B5563"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={25}
              />
              <YAxis
                domain={[Math.floor(minPrice - priceMargin), Math.ceil(maxPrice + priceMargin)]}
                stroke="#4B5563"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                orientation="right"
                tickFormatter={(val) => `₹${val.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="close"
                stroke={strokeColor}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#gradient-${symbol})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
