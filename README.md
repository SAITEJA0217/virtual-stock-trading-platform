# 📈 Kinetix Virtual Stock Trading Platform MVP

A high-performance, full-stack **Virtual Stock Trading Platform** designed for simulated equity trading on the Indian market. Built from scratch with Next.js 15, TypeScript, Tailwind CSS, Prisma ORM, SQLite, and Recharts.

> [!IMPORTANT]
> **SIMULATION ONLY • NO REAL MONEY**
> This application is strictly a virtual stock market simulator. There are **no real-money transactions, payment gateways, or live brokerage integrations**. All prices, orders, and balances are virtual.

---

## 🌟 Key Features

1. **Deterministic Historical Pricing Engine**:
   - Queries realistic synthetic OHLCV data across **10 Indian blue-chip stocks** and **15 trading days** (2,100 interval records).
   - Time-travel clock: Select any historical date and half-hour interval (`09:15` to `15:30`) to view exact database prices and chart progressions.
   - Graceful fallback: If an intermediate time (e.g. 10:37 AM) is picked, the system seamlessly serves the latest available interval record (10:15 AM) with an indicator.

2. **Atomic Trade Execution & Portfolio Engine**:
   - **Predefined User**: Automatically initializes with **Demo Trader** and **₹10,00,000.00** starting virtual cash.
   - **Atomic Buy Execution**: Validates funds, updates weighted average acquisition price:
     $$\text{newAverage} = \frac{(\text{existingQty} \times \text{existingAvg}) + (\text{newQty} \times \text{newPrice})}{\text{existingQty} + \text{newQty}}$$
   - **Atomic Sell Execution**: Validates position limits, calculates realized P/L:
     $$\text{realizedPL} = (\text{sellPrice} - \text{averageBuyPrice}) \times \text{soldQty}$$
   - **Mark-to-Market Valuation**: Dynamic Unrealized and Realized P/L calculations synchronized with the selected simulation timestamp.

3. **Modern Dark-First Financial Terminal UI**:
   - Dark theme (`#0B0F17` obsidian background with subtle borders and clear emerald/crimson indicators).
   - Interactive Recharts area & volume charts with **1D, 5D, 10D, and 15D** timeframe toggles.
   - Asset allocation donut chart and recent trades ledger.
   - Fully responsive for mobile, tablet, laptop, and desktop.

4. **10 Simulated Indian Equities**:
   - `RELIANCE` (Reliance Industries - Energy)
   - `TCS` (Tata Consultancy Services - IT)
   - `INFY` (Infosys - IT)
   - `HDFCBANK` (HDFC Bank - Banking)
   - `ICICIBANK` (ICICI Bank - Banking)
   - `SBIN` (State Bank of India - Banking)
   - `TATAMOTORS` (Tata Motors - Automobile)
   - `ITC` (ITC - FMCG)
   - `BHARTIARTL` (Bharti Airtel - Telecom)
   - `WIPRO` (Wipro - IT)

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Recharts
- **Backend**: Next.js API Routes / Server Endpoints
- **Database & ORM**: SQLite + Prisma ORM (with indexes on `[stockId, timestamp]`)
- **Data Engine**: Deterministic Geometric Brownian Motion synthetic market generator + CSV validator

---

## 📂 Project Architecture

```
├── data/
│   └── market-data.csv              # 2,100 deterministic OHLCV records
├── prisma/
│   ├── schema.prisma                # SQLite schema (User, Stock, MarketData, Transaction, PortfolioHolding)
│   └── dev.db                       # Local SQLite database
├── scripts/
│   ├── generate-market-data.ts      # Synthetic market data generator
│   ├── validate-data.ts             # CSV dataset validation script
│   └── seed.ts                      # Database seeding script
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Dashboard (/): Summary metrics, top movers, allocation, recent trades
│   │   ├── market/page.tsx          # Market (/market): 10 stock quotes, search, sector filters, quick trades
│   │   ├── stocks/[symbol]/page.tsx # Stock Details (/stocks/[symbol]): 1D/5D/10D/15D Recharts & OHLC stats
│   │   ├── portfolio/page.tsx       # Portfolio (/portfolio): Holdings table & Unrealized/Realized P/L
│   │   ├── transactions/page.tsx    # Transactions (/transactions): Complete execution history with filters
│   │   └── api/                     # REST API routes for user, stocks, charts, portfolio, and trade execution
│   ├── components/
│   │   ├── layout/                  # Navbar, Sidebar, SimulationBar
│   │   ├── dashboard/               # MetricCards, TopMovers, AllocationChart, RecentTransactions
│   │   ├── market/                  # StockTable
│   │   ├── stocks/                  # StockChart, StockStats
│   │   ├── portfolio/               # HoldingsTable
│   │   ├── transactions/            # TransactionsTable
│   │   ├── trade/                   # BuyModal, SellModal
│   │   └── ui/                      # ToastContainer
│   ├── context/
│   │   └── SimulationContext.tsx     # Global simulation timestamp & user state manager
│   └── lib/
│       ├── prisma.ts                # Prisma singleton
│       ├── calculations.ts          # Weighted average price & P/L formulas
│       ├── formatters.ts            # INR Currency (₹) & Date formatters
│       ├── market-service.ts        # Database market price & candle queries
│       └── types.ts                 # TypeScript types & DTOs
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Tested on Node v20+)
- npm or pnpm

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
# .env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
```

### 3. Generate & Validate Market Data
```bash
# Generate CSV dataset (2,100 records)
npm run generate:data

# Run validation checks on dataset
npm run validate:data
```

### 4. Push Database Schema & Seed
```bash
# Sync SQLite schema
npx prisma db push

# Seed 10 stocks, demo user (₹10,00,000 balance), and 2,100 market records
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js local development server |
| `npm run build` | Compiles the production build |
| `npm run start` | Runs the compiled production server |
| `npm run seed` | Seeds SQLite with the demo user, stocks, and 2,100 records |
| `npm run validate:data` | Validates CSV market dataset integrity |
| `npm run generate:data` | Re-generates deterministic synthetic market dataset |

---

## 🔄 End-to-End Demo Walkthrough

1. **Dashboard Overview**:
   - Open `/` to see **₹10,00,000.00** starting virtual cash, 0 active positions, Top Gainers & Losers, and the Live Simulation Clock.
2. **Time Navigation**:
   - Use the top **Simulation Bar** to switch between 15 trading days (e.g., *15 Sep 2026*) and 14 time intervals (e.g., *10:45 AM*).
   - Observe real-time price updates across all cards and tables.
3. **Inspect Stock & Historical Chart**:
   - Navigate to `/market` and click on **TCS**.
   - Switch between **1D, 5D, 10D, and 15D** chart views to view historical candle progression.
4. **Execute BUY Order**:
   - Click **BUY TCS**, enter 5 shares, and click execute.
   - Cash decreases by $(5 \times \text{price})$, a new `BUY` transaction is logged, and a holding is created.
5. **Inspect Portfolio & Unrealized P/L**:
   - Go to `/portfolio` to see 5 shares of TCS with current market value and unrealized P/L.
6. **Time-Travel Mark-to-Market**:
   - Advance the simulation clock to a later trading day and observe how the portfolio value and unrealized P/L change according to the new price.
7. **Execute SELL Order**:
   - Sell 2 shares of TCS.
   - Cash is credited, realized P/L is locked in, and remaining position is 3 shares.
8. **Audit Ledger**:
   - Open `/transactions` to verify the complete, filterable record of both `BUY` and `SELL` transactions.

---

## 🔒 Security & Data Integrity

- **Server-Authoritative Pricing**: All trades query the database price at the selected simulation timestamp on the server. The client cannot forge or tamper with execution prices.
- **Negative Balance & Short-Selling Protection**: Trades are rejected if cash or share quantities are insufficient.
- **Atomic Transactions**: All balance deductions, holding updates, and ledger inserts run inside `prisma.$transaction`.

---

## 📄 License & Attribution

Technical Assignment Submission (Target: 27 September 2026).
All market data is synthetic and simulated.
