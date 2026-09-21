'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserSummary, StockItem } from '@/lib/types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface SimulationContextType {
  // Time state
  currentTimestamp: string;
  currentDate: string;
  currentTime: string;
  availableDates: string[];
  availableTimes: string[];
  allTimestamps: { date: string; time: string; timestamp: string }[];
  isLatest: boolean;
  isEarliest: boolean;
  isLoadingTime: boolean;
  
  // Time navigation
  setSimulationTimestamp: (ts: string) => void;
  setSimulationDate: (date: string) => void;
  setSimulationTime: (time: string) => void;
  stepForward: () => void;
  stepBackward: () => void;
  jumpToLatest: () => void;
  jumpToEarliest: () => void;

  // User & Portfolio state
  userSummary: UserSummary | null;
  isLoadingUser: boolean;
  refreshUserData: () => Promise<void>;

  // Trade Modal Controls
  selectedTradeStock: StockItem | null;
  tradeModalType: 'BUY' | 'SELL' | null;
  openBuyModal: (stock: StockItem) => void;
  openSellModal: (stock: StockItem) => void;
  closeTradeModal: () => void;

  // Toast System
  toasts: Toast[];
  showToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [currentTimestamp, setCurrentTimestamp] = useState<string>('2026-09-21T15:30:00.000Z');
  const [currentDate, setCurrentDate] = useState<string>('2026-09-21');
  const [currentTime, setCurrentTime] = useState<string>('15:30');
  
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [allTimestamps, setAllTimestamps] = useState<{ date: string; time: string; timestamp: string }[]>([]);
  const [isLoadingTime, setIsLoadingTime] = useState<boolean>(true);

  const [userSummary, setUserSummary] = useState<UserSummary | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  const [selectedTradeStock, setSelectedTradeStock] = useState<StockItem | null>(null);
  const [tradeModalType, setTradeModalType] = useState<'BUY' | 'SELL' | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Fetch available simulation timestamps
  const fetchTimestamps = useCallback(async () => {
    try {
      setIsLoadingTime(true);
      const res = await fetch('/api/simulation/timestamps');
      if (res.ok) {
        const data = await res.json();
        setAvailableDates(data.availableDates || []);
        setAvailableTimes(data.availableTimes || []);
        setAllTimestamps(data.allTimestamps || []);

        if (data.latest && !currentTimestamp) {
          setCurrentTimestamp(data.latest.timestamp);
          setCurrentDate(data.latest.date);
          setCurrentTime(data.latest.time);
        } else if (data.latest && currentTimestamp === '2026-09-21T15:30:00.000Z') {
          // Sync with database latest
          setCurrentTimestamp(data.latest.timestamp);
          setCurrentDate(data.latest.date);
          setCurrentTime(data.latest.time);
        }
      }
    } catch (err) {
      console.error('Failed to load simulation timestamps:', err);
    } finally {
      setIsLoadingTime(false);
    }
  }, [currentTimestamp]);

  // Fetch user portfolio summary
  const refreshUserData = useCallback(async () => {
    try {
      setIsLoadingUser(true);
      const res = await fetch(`/api/user?timestamp=${encodeURIComponent(currentTimestamp)}`);
      if (res.ok) {
        const data = await res.json();
        setUserSummary(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    } finally {
      setIsLoadingUser(false);
    }
  }, [currentTimestamp]);

  useEffect(() => {
    fetchTimestamps();
  }, [fetchTimestamps]);

  useEffect(() => {
    if (currentTimestamp) {
      refreshUserData();
    }
  }, [currentTimestamp, refreshUserData]);

  // Time navigation handlers
  const handleSetTimestamp = (ts: string) => {
    setCurrentTimestamp(ts);
    const date = ts.split('T')[0];
    const time = ts.split('T')[1].substring(0, 5);
    setCurrentDate(date);
    setCurrentTime(time);
  };

  const handleSetDate = (newDate: string) => {
    setCurrentDate(newDate);
    // Find closest available timestamp with this date and current time, or earliest time of that day
    const matching = allTimestamps.find((t) => t.date === newDate && t.time === currentTime);
    if (matching) {
      setCurrentTimestamp(matching.timestamp);
    } else {
      const dayMatches = allTimestamps.filter((t) => t.date === newDate);
      if (dayMatches.length > 0) {
        const target = dayMatches[0];
        setCurrentTime(target.time);
        setCurrentTimestamp(target.timestamp);
      }
    }
  };

  const handleSetTime = (newTime: string) => {
    setCurrentTime(newTime);
    const matching = allTimestamps.find((t) => t.date === currentDate && t.time === newTime);
    if (matching) {
      setCurrentTimestamp(matching.timestamp);
    } else {
      // Fallback timestamp string
      const ts = `${currentDate}T${newTime}:00.000Z`;
      setCurrentTimestamp(ts);
    }
  };

  const currentIndex = allTimestamps.findIndex((t) => t.timestamp === currentTimestamp);
  const isLatest = currentIndex === allTimestamps.length - 1 || (allTimestamps.length > 0 && currentIndex === -1 && currentTimestamp >= allTimestamps[allTimestamps.length - 1].timestamp);
  const isEarliest = currentIndex === 0;

  const stepForward = () => {
    if (currentIndex >= 0 && currentIndex < allTimestamps.length - 1) {
      handleSetTimestamp(allTimestamps[currentIndex + 1].timestamp);
    }
  };

  const stepBackward = () => {
    if (currentIndex > 0) {
      handleSetTimestamp(allTimestamps[currentIndex - 1].timestamp);
    }
  };

  const jumpToLatest = () => {
    if (allTimestamps.length > 0) {
      handleSetTimestamp(allTimestamps[allTimestamps.length - 1].timestamp);
    }
  };

  const jumpToEarliest = () => {
    if (allTimestamps.length > 0) {
      handleSetTimestamp(allTimestamps[0].timestamp);
    }
  };

  // Trade modals
  const openBuyModal = (stock: StockItem) => {
    setSelectedTradeStock(stock);
    setTradeModalType('BUY');
  };

  const openSellModal = (stock: StockItem) => {
    setSelectedTradeStock(stock);
    setTradeModalType('SELL');
  };

  const closeTradeModal = () => {
    setSelectedTradeStock(null);
    setTradeModalType(null);
  };

  // Toast management
  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <SimulationContext.Provider
      value={{
        currentTimestamp,
        currentDate,
        currentTime,
        availableDates,
        availableTimes,
        allTimestamps,
        isLatest,
        isEarliest,
        isLoadingTime,
        setSimulationTimestamp: handleSetTimestamp,
        setSimulationDate: handleSetDate,
        setSimulationTime: handleSetTime,
        stepForward,
        stepBackward,
        jumpToLatest,
        jumpToEarliest,
        userSummary,
        isLoadingUser,
        refreshUserData,
        selectedTradeStock,
        tradeModalType,
        openBuyModal,
        openSellModal,
        closeTradeModal,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
