import fs from 'fs';
import path from 'path';

export function validateCsv(filePath?: string): { success: boolean; errors: string[]; stats: any } {
  const csvPath = filePath || path.join(process.cwd(), 'data', 'market-data.csv');

  if (!fs.existsSync(csvPath)) {
    return {
      success: false,
      errors: [`Market data file does not exist at path: ${csvPath}`],
      stats: null
    };
  }

  const content = fs.readFileSync(csvPath, 'utf-8').trim();
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  if (lines.length <= 1) {
    return {
      success: false,
      errors: ['CSV file is empty or contains only headers'],
      stats: null
    };
  }

  const headerLine = lines[0];
  const expectedHeaders = ['symbol', 'date', 'time', 'timestamp', 'open', 'high', 'low', 'close', 'volume'];
  const actualHeaders = headerLine.split(',').map(h => h.trim());

  const errors: string[] = [];

  for (const exp of expectedHeaders) {
    if (!actualHeaders.includes(exp)) {
      errors.push(`Missing required column header: ${exp}`);
    }
  }

  const symbolIndex = actualHeaders.indexOf('symbol');
  const dateIndex = actualHeaders.indexOf('date');
  const timeIndex = actualHeaders.indexOf('time');
  const timestampIndex = actualHeaders.indexOf('timestamp');
  const openIndex = actualHeaders.indexOf('open');
  const highIndex = actualHeaders.indexOf('high');
  const lowIndex = actualHeaders.indexOf('low');
  const closeIndex = actualHeaders.indexOf('close');
  const volumeIndex = actualHeaders.indexOf('volume');

  const symbols = new Set<string>();
  const dates = new Set<string>();
  const uniqueKeySet = new Set<string>();

  let validRowCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1;
    const cols = lines[i].split(',').map(c => c.trim());

    if (cols.length !== actualHeaders.length) {
      errors.push(`Row ${rowNum}: Expected ${actualHeaders.length} columns, found ${cols.length}`);
      continue;
    }

    const symbol = cols[symbolIndex];
    const date = cols[dateIndex];
    const time = cols[timeIndex];
    const timestampStr = cols[timestampIndex];
    const open = parseFloat(cols[openIndex]);
    const high = parseFloat(cols[highIndex]);
    const low = parseFloat(cols[lowIndex]);
    const close = parseFloat(cols[closeIndex]);
    const volume = parseInt(cols[volumeIndex], 10);

    if (!symbol || !date || !time || !timestampStr) {
      errors.push(`Row ${rowNum}: Missing critical string field`);
      continue;
    }

    symbols.add(symbol);
    dates.add(date);

    // Uniqueness check
    const key = `${symbol}_${timestampStr}`;
    if (uniqueKeySet.has(key)) {
      errors.push(`Row ${rowNum}: Duplicate record found for symbol ${symbol} and timestamp ${timestampStr}`);
    } else {
      uniqueKeySet.add(key);
    }

    // Number validation
    if (isNaN(open) || open <= 0) errors.push(`Row ${rowNum} (${symbol}): Invalid Open price ${cols[openIndex]}`);
    if (isNaN(high) || high <= 0) errors.push(`Row ${rowNum} (${symbol}): Invalid High price ${cols[highIndex]}`);
    if (isNaN(low) || low <= 0) errors.push(`Row ${rowNum} (${symbol}): Invalid Low price ${cols[lowIndex]}`);
    if (isNaN(close) || close <= 0) errors.push(`Row ${rowNum} (${symbol}): Invalid Close price ${cols[closeIndex]}`);
    if (isNaN(volume) || volume <= 0) errors.push(`Row ${rowNum} (${symbol}): Invalid Volume ${cols[volumeIndex]}`);

    // OHLC Consistency Check
    // low <= open <= high AND low <= close <= high
    const epsilon = 0.0001;
    if (open > high + epsilon || open < low - epsilon) {
      errors.push(`Row ${rowNum} (${symbol}): Open price (${open}) outside Low-High bounds [${low}, ${high}]`);
    }
    if (close > high + epsilon || close < low - epsilon) {
      errors.push(`Row ${rowNum} (${symbol}): Close price (${close}) outside Low-High bounds [${low}, ${high}]`);
    }
    if (low > high) {
      errors.push(`Row ${rowNum} (${symbol}): Low price (${low}) is greater than High price (${high})`);
    }

    // Date/Timestamp format check
    const parsedDate = new Date(timestampStr);
    if (isNaN(parsedDate.getTime())) {
      errors.push(`Row ${rowNum} (${symbol}): Invalid ISO timestamp format '${timestampStr}'`);
    }

    validRowCount++;
  }

  const expectedSymbols = [
    'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK',
    'SBIN', 'TATAMOTORS', 'ITC', 'BHARTIARTL', 'WIPRO'
  ];

  for (const expSym of expectedSymbols) {
    if (!symbols.has(expSym)) {
      errors.push(`Expected symbol ${expSym} is missing in dataset`);
    }
  }

  if (symbols.size !== 10) {
    errors.push(`Expected exactly 10 distinct symbols, found ${symbols.size}`);
  }

  if (dates.size < 10) {
    errors.push(`Expected 10-15 trading dates, found ${dates.size}`);
  }

  const stats = {
    totalRows: lines.length - 1,
    validRows: validRowCount,
    uniqueSymbolsCount: symbols.size,
    symbols: Array.from(symbols),
    tradingDaysCount: dates.size,
    dates: Array.from(dates).sort()
  };

  return {
    success: errors.length === 0,
    errors,
    stats
  };
}

if (require.main === module || process.argv[1]?.includes('validate-data')) {
  console.log('🔍 Validating CSV market dataset...');
  const result = validateCsv();
  if (result.success) {
    console.log('✅ Market Data Validation PASSED!');
    console.log(`📊 Total Records: ${result.stats.totalRows}`);
    console.log(`📈 Distinct Symbols: ${result.stats.uniqueSymbolsCount} (${result.stats.symbols.join(', ')})`);
    console.log(`📅 Trading Days: ${result.stats.tradingDaysCount} days (${result.stats.dates[0]} to ${result.stats.dates[result.stats.dates.length - 1]})`);
    process.exit(0);
  } else {
    console.error('❌ Market Data Validation FAILED!');
    console.error(`Found ${result.errors.length} errors:`);
    result.errors.slice(0, 10).forEach(e => console.error(`  - ${e}`));
    if (result.errors.length > 10) {
      console.error(`  ... and ${result.errors.length - 10} more errors`);
    }
    process.exit(1);
  }
}
