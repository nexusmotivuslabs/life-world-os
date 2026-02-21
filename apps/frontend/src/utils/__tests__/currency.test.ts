import { describe, it, expect } from 'vitest'
import { formatCurrency, formatCurrencySimple, formatNumber } from '../currency'

describe('formatCurrency', () => {
  it('formats a number as UK currency with default options', () => {
    expect(formatCurrency(1234.56)).toBe('£1,234.56')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('£0.00')
  })

  it('respects custom minimumFractionDigits', () => {
    expect(formatCurrency(100, { minimumFractionDigits: 2 })).toBe('£100.00')
  })

  it('respects custom maximumFractionDigits when min <= max', () => {
    expect(formatCurrency(1234.5, { minimumFractionDigits: 0, maximumFractionDigits: 1 })).toBe('£1,234.5')
  })
})

describe('formatCurrencySimple', () => {
  it('formats with default decimals', () => {
    expect(formatCurrencySimple(1000)).toBe('£1,000.00')
  })

  it('respects custom decimals', () => {
    expect(formatCurrencySimple(1000.123, 1)).toBe('£1,000.1')
  })
})

describe('formatNumber', () => {
  it('formats with commas and default decimals', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56')
  })

  it('respects custom decimals', () => {
    expect(formatNumber(1000, 0)).toBe('1,000')
  })
})
