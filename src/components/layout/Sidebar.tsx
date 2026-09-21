'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LineChart, Briefcase, History, HelpCircle } from 'lucide-react';
import { useSimulation } from '@/context/SimulationContext';
import { formatINR } from '@/lib/formatters';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Market', href: '/market', icon: LineChart },
  { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { name: 'Transactions', href: '/transactions', icon: History },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { userSummary } = useSimulation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#0E131F] border-r border-gray-800 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Mobile brand header */}
          <div className="flex items-center justify-between md:hidden pb-2 border-b border-gray-800">
            <span className="font-bold text-white text-lg">Menu</span>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Snapshot Card */}
        <div className="p-4 space-y-3">
          <div className="p-3.5 rounded-xl bg-gray-900/90 border border-gray-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Account Value</span>
              <span className="text-gray-500">Live</span>
            </div>
            <div className="text-lg font-bold text-white">
              {userSummary ? formatINR(userSummary.totalAccountValue) : '₹10,00,000.00'}
            </div>
            <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px]">
              <span className="text-gray-400">Total P/L:</span>
              <span
                className={`font-semibold ${
                  (userSummary?.totalPL || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {userSummary && userSummary.totalPL >= 0 ? '+' : ''}
                {userSummary ? formatINR(userSummary.totalPL) : '₹0.00'}
              </span>
            </div>
          </div>

          <div className="px-2 text-[11px] text-gray-500 text-center leading-relaxed">
            Technical Assignment MVP
            <br />
            Submission: 27 Sep 2026
          </div>
        </div>
      </aside>
    </>
  );
}
