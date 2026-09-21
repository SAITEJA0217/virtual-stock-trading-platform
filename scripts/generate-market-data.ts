import fs from 'fs';
import path from 'path';

// Seeded PRNG (Mulberry32) for 100% deterministic output
function createPrng(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const prng = createPrng(42);

export interface StockDef {
  symbol: string;
  name: string;
  sector: string;
  basePrice: number;
  volatility: number;
  baseVolume: number;
}

export const STOCKS: StockDef[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy', basePrice: 2950.0, volatility: 0.008, baseVolume: 850000 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', basePrice: 3820.0, volatility: 0.007, baseVolume: 620000 },
  { symbol: 'INFY', name: 'Infosys', sector: 'IT', basePrice: 1640.0, volatility: 0.009, baseVolume: 920000 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking', basePrice: 1540.0, volatility: 0.008, baseVolume: 1200000 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banking', basePrice: 1110.0, volatility: 0.009, baseVolume: 1100000 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', basePrice: 775.0, volatility: 0.011, baseVolume: 1400000 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Automobile', basePrice: 955.0, volatility: 0.012, baseVolume: 950000 },
  { symbol: 'ITC', name: 'ITC', sector: 'FMCG', basePrice: 435.0, volatility: 0.006, baseVolume: 1800000 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecom', basePrice: 1375.0, volatility: 0.008, baseVolume: 750000 },
  { symbol: 'WIPRO', name: 'Wipro', sector: 'IT', basePrice: 485.0, volatility: 0.009, baseVolume: 680000 }
];

export const TRADING_DATES = [
  '2026-09-01',
  '2026-09-02',
  '2026-09-03',
  '2026-09-04',
  '2026-09-07',
  '2026-09-08',
  '2026-09-09',
  '2026-09-10',
  '2026-09-11',
  '2026-09-14',
  '2026-09-15',
  '2026-09-16',
  '2026-09-17',
  '2026-09-18',
  '2026-09-21'
];

export const TIME_INTERVALS = [
  '09:15',
  '09:45',
  '10:15',
  '10:45',
  '11:15',
  '11:45',
  '12:15',
  '12:45',
  '13:15',
  '13:45',
  '14:15',
  '14:45',
  '15:15',
  '15:30'
];

export interface MarketRecord {
  symbol: string;
  date: string;
  time: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function generateMarketData(): MarketRecord[] {
  const records: MarketRecord[] = [];

  for (const stock of STOCKS) {
    let currentPrice = stock.basePrice;

    for (const date of TRADING_DATES) {
      // Small overnight gap (+-0.5%)
      const overnightReturn = (prng() - 0.49) * 0.01;
      currentPrice = Number((currentPrice * (1 + overnightReturn)).toFixed(2));

      for (let i = 0; i < TIME_INTERVALS.length; i++) {
        const time = TIME_INTERVALS[i];
        const timestamp = `${date}T${time}:00.000Z`;

        const open = currentPrice;
        // Intraday return between -volatility and +volatility
        const changePercent = (prng() - 0.495) * 2 * stock.volatility;
        let close = Number((open * (1 + changePercent)).toFixed(2));
        if (close <= 0) close = 1.0;

        // High & Low must strictly bound open & close
        const maxOC = Math.max(open, close);
        const minOC = Math.min(open, close);

        const highDelta = Number((maxOC * prng() * stock.volatility * 0.8).toFixed(2));
        const lowDelta = Number((minOC * prng() * stock.volatility * 0.8).toFixed(2));

        const high = Number((maxOC + highDelta).toFixed(2));
        let low = Number((minOC - lowDelta).toFixed(2));
        if (low <= 0) low = 0.5;

        // Ensure strict invariants
        const finalHigh = Math.max(high, open, close);
        const finalLow = Math.min(low, open, close);

        // Volume calculation (higher volume at market open 09:15 and close 15:30)
        let volMultiplier = 0.7 + prng() * 0.6;
        if (i === 0 || i === TIME_INTERVALS.length - 1) {
          volMultiplier *= 1.8;
        }
        const volume = Math.floor(stock.baseVolume * volMultiplier / TIME_INTERVALS.length);

        records.push({
          symbol: stock.symbol,
          date,
          time,
          timestamp,
          open,
          high: finalHigh,
          low: finalLow,
          close,
          volume: Math.max(volume, 1000)
        });

        currentPrice = close;
      }
    }
  }

  return records;
}

export function saveCsv(): void {
  const records = generateMarketData();
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const csvPath = path.join(dataDir, 'market-data.csv');
  const headers = 'symbol,date,time,timestamp,open,high,low,close,volume\n';
  const rows = records
    .map(r => `${r.symbol},${r.date},${r.time},${r.timestamp},${r.open},${r.high},${r.low},${r.close},${r.volume}`)
    .join('\n');

  fs.writeFileSync(csvPath, headers + rows, 'utf-8');
  console.log(`[CSV Generator] Successfully generated ${records.length} records into ${csvPath}`);
}

if (require.main === module || process.argv[1]?.includes('generate-market-data')) {
  saveCsv();
}
