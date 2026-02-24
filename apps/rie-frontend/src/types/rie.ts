/** Mirrors the Pydantic schemas from apps/rie-backend/api/schemas.py */

export type WarningLevel = 'green' | 'yellow' | 'orange' | 'red'

export interface SignalResult {
  yoy_change: number | null
  rolling_slope: number | null
  inflection_detected: boolean
  zscore_vs_10yr: number | null
  ma_divergence: number | null
  latest_year: number | null
  latest_value: number | null
  descriptions: string[]
}

export interface DataPoint {
  year: number
  value: number
}

export interface MetricState {
  indicator: string
  name: string
  latest_value: number | null
  units: string
  source: string
  last_updated: string | null
  series: DataPoint[]
  signals: SignalResult | null
  pressure_direction: 'high_is_bad' | 'low_is_bad' | 'neutral'
}

export interface ConstraintResult {
  id: string
  name: string
  layer: number
  country: string
  time_horizon: string
  metrics: MetricState[]
  structural_message: string
  warning_level: WarningLevel
  thesis: string
  implications: string[]
  disconfirming_conditions: string[]
}

export interface DashboardData {
  country: string
  constraints: ConstraintResult[]
  overall_warning: WarningLevel
  generated_at: string
}

export interface RefreshResponse {
  status: string
  refreshed: string[]
  errors: Record<string, string>
}
