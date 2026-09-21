# 📈 Kinetix Virtual Stock Trading Platform MVP

A complete, high-performance **Virtual Stock Trading Platform MVP** designed for simulated equity trading on the Indian market. Built from scratch with Next.js 15, TypeScript, Tailwind CSS, Prisma ORM, SQLite, and Recharts.

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
   - **Server-Authoritative Pricing**: Execution prices are strictly resolved server-side from the SQLite database; client-supplied prices (e.g. malicious price tampering) are discarded.
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

## 🧪 Available Scripts & Verification

| Command | Description |
| :--- | :--- |
| `npm run lint` | Runs ESLint checks across all project files |
| `npm run validate:data` | Validates CSV market dataset integrity (OHLC bounds, volumes) |
| `npm run test:e2e` | Runs comprehensive 26-test E2E suite including anti-spoofing security verification |
| `npm run build` | Compiles Next.js production build with full type checking and linting |
| `npm run dev` | Starts the local development server |
| `npm run seed` | Seeds SQLite with the demo user, stocks, and 2,100 records |

---

## 📄 License & Attribution

Technical Assignment Submission (Target: 27 September 2026).
All market data is synthetic and simulated.
