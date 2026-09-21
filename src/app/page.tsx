'use client';

import React, { useState, useEffect } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { TopMovers } from '@/components/dashboard/TopMovers';
import { AllocationChart } from '@/components/dashboard/AllocationChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { StockItem, PortfolioHoldingItem, TransactionItem } from '@/lib/types';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { currentTimestamp, userSummary } = useSimulation();

  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [holdings, setHoldings] = useState<PortfolioHoldingItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoadingStocks, setIsLoadingStocks] = useState(true);
  const [isLoadingHoldings, setIsLoadingHoldings] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  // Fetch stocks at current timestamp
  useEffect(() => {
    async function fetchStocks() {
      try {
        setIsLoadingStocks(true);
        const res = await fetch(`/api/stocks?timestamp=${encodeURIComponent(currentTimestamp)}`);
        if (res.ok) {
          const data = await res.json();
          setStocks(data.stocks || []);
        }
      } catch (err) {
        console.error('Failed to load stocks:', err);
      } finally {
        setIsLoadingStocks(false);
      }
    }

    fetchStocks();
  }, [currentTimestamp]);

  // Fetch portfolio holdings at current timestamp
  useEffect(() => {
    async function fetchPortfolio() {
      try {
        setIsLoadingHoldings(true);
        const res = await fetch(`/api/portfolio?timestamp=${encodeURIComponent(currentTimestamp)}`);
        if (res.ok) {
          const data = await res.json();
          setHoldings(data.holdings || []);
        }
      } catch (err) {
        console.error('Failed to load portfolio:', err);
      } finally {
        setIsLoadingHoldings(false);
      }
    }

    fetchPortfolio();
  }, [currentTimestamp, userSummary]);

  // Fetch recent transactions
  useEffect(() => {
    async function fetchTransactions() {
      try {
        setIsLoadingTransactions(true);
        const res = await fetch('/api/transactions');
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions || []);
        }
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setIsLoadingTransactions(false);
      }
    }

    fetchTransactions();
  }, [userSummary]);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-gray-900/60 to-emerald-950/40 border border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Trading Terminal</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Simulation
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Welcome, <strong>Demo Trader</strong>. Test market strategies with simulated Indian equities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/market"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition"
          >
            <span>Trade Equities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/portfolio"
            className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700 font-semibold text-xs transition"
          >
            View Portfolio
          </Link>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <MetricCards />

      {/* Top Movers (Gainers & Losers) */}
      <TopMovers stocks={stocks} isLoading={isLoadingStocks} />

      {/* Grid: Portfolio Allocation & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationChart
          holdings={holdings}
          cashBalance={userSummary?.cashBalance || 0}
          isLoading={isLoadingHoldings}
        />
        <RecentTransactions
          transactions={transactions}
          isLoading={isLoadingTransactions}
        />
      </div>
    </div>
  );
}
