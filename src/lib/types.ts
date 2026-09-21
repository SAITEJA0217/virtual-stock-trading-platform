export interface StockItem {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  previousClose: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  timestamp: string;
  isExactMatch: boolean;
}

export interface UserSummary {
  id: string;
  name: string;
  cashBalance: number;
  investedValue: number;
  currentPortfolioValue: number;
  totalAccountValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  realizedPL: number;
  totalPL: number;
  holdingsCount: number;
}

export interface PortfolioHoldingItem {
  id: string;
  stockId: string;
  symbol: string;
  name: string;
  sector: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  investedAmount: number;
  currentValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  allocationPercent: number;
}

export interface TransactionItem {
  id: string;
  userId: string;
  stockId: string;
  symbol: string;
  name: string;
  sector: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  totalAmount: number;
  timestamp: string;
}

export interface ChartCandle {
  timestamp: string;
  date: string;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SimulationTimeInfo {
  currentTimestamp: string;
  currentDate: string;
  currentTime: string;
  availableDates: string[];
  availableTimes: string[];
  allTimestamps: { date: string; time: string; timestamp: string }[];
  isLatest: boolean;
}
