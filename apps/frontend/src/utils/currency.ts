/**
 * Currency formatting utilities for UK locale
 */

/**
 * Format a number as UK currency (£)
 */
export function formatCurrency(amount: number, options?: {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}): string {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options || {}

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}

/**
 * Format a number with pound symbol (simpler version for display)
 */
export function formatCurrencySimple(amount: number, decimals: number = 2): string {
  return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

/**
 * Format a number with commas (no currency symbol)
 */
export function formatNumber(amount: number, decimals: number = 2): string {
  return amount.toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}





