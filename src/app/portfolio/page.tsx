'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { HoldingsTable } from '@/components/portfolio/HoldingsTable';
import { AllocationChart } from '@/components/dashboard/AllocationChart';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { PortfolioHoldingItem } from '@/lib/types';
import { Briefcase, RefreshCw } from 'lucide-react';

export default function PortfolioPage() {
  const { currentTimestamp, userSummary } = useSimulation();
  const [holdings, setHoldings] = useState<PortfolioHoldingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPortfolio = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/portfolio?timestamp=${encodeURIComponent(currentTimestamp)}`);
      if (res.ok) {
        const data = await res.json();
        setHoldings(data.holdings || []);
      }
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentTimestamp]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio, userSummary]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-400" />
            <span>Virtual Portfolio & Holdings</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time mark-to-market valuation, weighted average acquisition prices, and realized vs unrealized P/L.
          </p>
        </div>

        <button
          onClick={fetchPortfolio}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 text-xs font-medium transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Portfolio</span>
        </button>
      </div>

      {/* Metric Cards */}
      <MetricCards />

      {/* Holdings Table */}
      <HoldingsTable holdings={holdings} isLoading={isLoading} />

      {/* Asset Allocation Breakdown Chart */}
      <AllocationChart
        holdings={holdings}
        cashBalance={userSummary?.cashBalance || 0}
        isLoading={isLoading}
      />
    </div>
  );
}
