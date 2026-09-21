/**
 * Format numbers into Indian Rupee currency format (e.g., ₹10,00,000.00 or ₹3,827.90)
 */
export function formatINR(value: number, decimals: number = 2): string {
  if (isNaN(value) || value === null || value === undefined) return '₹0.00';
  
  const isNegative = value < 0;
  const absVal = Math.abs(value);
  const formatted = absVal.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Format percentage with positive/negative sign
 */
export function formatPercent(value: number, decimals: number = 2): string {
  if (isNaN(value) || value === null || value === undefined) return '0.00%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format number with Indian numbering system (Lakhs, Crores) for volume and big metrics
 */
export function formatVolume(num: number): string {
  if (isNaN(num)) return '0';
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `${(num / 100000).toFixed(2)} L`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} K`;
  }
  return num.toLocaleString('en-IN');
}

/**
 * Format date string (e.g., 2026-09-15 -> 15 Sep 2026)
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format time string (e.g. 09:15 -> 09:15 AM, 15:30 -> 03:30 PM)
 */
export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = hours < 10 ? `0${hours}` : `${hours}`;
  return `${strHours}:${minutes} ${ampm}`;
}

/**
 * Format timestamp into "15 Sep 2026 · 10:45 AM"
 */
export function formatDateTimeDisplay(timestampStr: string): string {
  if (!timestampStr) return '';
  const d = new Date(timestampStr);
  if (isNaN(d.getTime())) return timestampStr;
  
  const dateFormatted = d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  const timeFormatted = formatTimeDisplay(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
  
  return `${dateFormatted} · ${timeFormatted}`;
}
