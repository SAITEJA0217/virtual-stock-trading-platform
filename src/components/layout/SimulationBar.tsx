'use client';

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { formatDateDisplay, formatTimeDisplay } from '@/lib/formatters';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

export function SimulationBar() {
  const {
    currentDate,
    currentTime,
    availableDates,
    availableTimes,
    setSimulationDate,
    setSimulationTime,
    stepForward,
    stepBackward,
    jumpToLatest,
    jumpToEarliest,
    isLatest,
    isEarliest,
    isLoadingTime,
  } = useSimulation();

  return (
    <div className="w-full bg-[#111827]/90 border-b border-gray-800/90 py-3 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Left: Simulation Time Title & Quick State */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Market Simulation Clock</span>
          </div>

          <div className="text-sm font-semibold text-white tracking-wide">
            {formatDateDisplay(currentDate)} · {formatTimeDisplay(currentTime)}
          </div>
        </div>

        {/* Center/Right: Interactive Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Date Selector */}
          <div className="relative flex items-center">
            <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
            <select
              value={currentDate}
              onChange={(e) => setSimulationDate(e.target.value)}
              disabled={isLoadingTime}
              className="bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg pl-8 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer hover:border-gray-600 transition"
              aria-label="Select Market Date"
            >
              {availableDates.map((dateStr) => (
                <option key={dateStr} value={dateStr}>
                  {formatDateDisplay(dateStr)}
                </option>
              ))}
            </select>
          </div>

          {/* Time Selector */}
          <div className="relative flex items-center">
            <Clock className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
            <select
              value={currentTime}
              onChange={(e) => setSimulationTime(e.target.value)}
              disabled={isLoadingTime}
              className="bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg pl-8 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer hover:border-gray-600 transition"
              aria-label="Select Market Time"
            >
              {availableTimes.map((timeStr) => (
                <option key={timeStr} value={timeStr}>
                  {formatTimeDisplay(timeStr)}
                </option>
              ))}
            </select>
          </div>

          {/* Step Back & Step Forward */}
          <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg p-0.5">
            <button
              onClick={stepBackward}
              disabled={isEarliest || isLoadingTime}
              title="Step backward 30 min"
              className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 rounded hover:bg-gray-800 transition"
              aria-label="Step Backward"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-gray-500 px-1 font-mono">30m</span>
            <button
              onClick={stepForward}
              disabled={isLatest || isLoadingTime}
              title="Step forward 30 min"
              className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 rounded hover:bg-gray-800 transition"
              aria-label="Step Forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick jump to Latest */}
          <button
            onClick={jumpToLatest}
            disabled={isLatest || isLoadingTime}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              isLatest
                ? 'bg-gray-900 text-gray-500 border border-gray-800 cursor-default'
                : 'bg-blue-600/20 text-blue-300 border border-blue-500/40 hover:bg-blue-600/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Latest Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
