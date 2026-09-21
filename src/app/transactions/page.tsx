'use client';

import React, { useState, useEffect } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { TransactionsTable } from '@/components/transactions/TransactionsTable';
import { TransactionItem } from '@/lib/types';
import { History, RefreshCw } from 'lucide-react';

export default function TransactionsPage() {
  const { userSummary } = useSimulation();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [userSummary]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-400" />
            <span>Transaction Ledger & Audit History</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Complete simulated order execution logs with timestamps and exact execution prices.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 text-xs font-medium transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Transactions Table */}
      <TransactionsTable transactions={transactions} isLoading={isLoading} />
    </div>
  );
}
