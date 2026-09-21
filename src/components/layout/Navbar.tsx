'use client';

import React from 'react';
import Link from 'next/link';
import { useSimulation } from '@/context/SimulationContext';
import { formatINR } from '@/lib/formatters';
import { TrendingUp, Wallet, ShieldAlert, UserCheck } from 'lucide-react';

export function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { userSummary, isLoadingUser } = useSimulation();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0F17]/90 backdrop-blur-md border-b border-gray-800">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 focus:outline-none"
            aria-label="Toggle navigation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">Kinetix</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Virtual
                </span>
              </div>
              <p className="text-[10px] text-gray-400 -mt-0.5">Indian Equities Simulator</p>
            </div>
          </Link>
        </div>

        {/* Center: Strict No Real Money Warning Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Simulation only • No real money trading</span>
        </div>

        {/* Right: User & Balance Info */}
        <div className="flex items-center gap-3">
          {/* User badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-300">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-gray-200">Demo Trader</span>
          </div>

          {/* Cash Balance */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-900/90 border border-emerald-500/30 shadow-inner">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium leading-none">
                Virtual Cash
              </div>
              <div className="text-sm font-bold text-emerald-400 leading-tight">
                {isLoadingUser || !userSummary ? '₹--' : formatINR(userSummary.cashBalance)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
