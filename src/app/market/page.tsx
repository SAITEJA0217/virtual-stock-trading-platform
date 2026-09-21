'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { StockTable } from '@/components/market/StockTable';
import { StockItem } from '@/lib/types';
import { LineChart, RefreshCw } from 'lucide-react';

export default function MarketPage() {
  const { currentTimestamp } = useSimulation();
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStocks = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/stocks?timestamp=${encodeURIComponent(currentTimestamp)}`);
      if (res.ok) {
        const data = await res.json();
        setStocks(data.stocks || []);
      }
    } catch (err) {
      console.error('Failed to load stocks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentTimestamp]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <LineChart className="w-6 h-6 text-blue-400" />
            <span>Market Stock Listings</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time simulated quotes for top 10 Indian equities across Banking, IT, Energy, Auto & Telecom.
          </p>
        </div>

        <button
          onClick={fetchStocks}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 text-xs font-medium transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Quotes</span>
        </button>
      </div>

      {/* Stock Table */}
      <StockTable stocks={stocks} isLoading={isLoading} />
    </div>
  );
}
