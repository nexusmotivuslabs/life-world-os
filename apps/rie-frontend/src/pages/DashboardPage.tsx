import { useEffect } from 'react'
import { useDashboardStore } from '../store/dashboardStore'
import { ConstraintCard } from '../components/ConstraintCard'
import { WarningLevelBadge } from '../components/WarningLevel'

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short',
    })
  } catch {
    return iso
  }
}

export function DashboardPage() {
  const { data, loading, error, refreshing, fetchDashboard, refresh } = useDashboardStore()

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-500/20 border border-orange-500/30">
                <span className="text-sm font-bold text-orange-400">R</span>
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white leading-none">
                  Reality Intelligence Engine
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-gray-500">United Kingdom</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-xs text-gray-500">Macro Constraint Analysis</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-xs text-gray-500">15–20yr Horizon</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {data && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Overall:</span>
                <WarningLevelBadge level={data.overall_warning} size="sm" />
              </div>
            )}
            <button
              onClick={refresh}
              disabled={refreshing || loading}
              className="rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 hover:border-gray-600 hover:text-white disabled:opacity-40 transition-colors"
            >
              {refreshing ? 'Refreshing…' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </header>

      {/* Sub-header */}
      {data && (
        <div className="border-b border-gray-800/60 bg-gray-900/40">
          <div className="mx-auto max-w-7xl px-6 py-2 flex items-center gap-4 text-xs text-gray-500">
            <span>Generated: {formatTimestamp(data.generated_at)}</span>
            <span className="text-gray-700">·</span>
            <span>Constraints: {data.constraints.length} active layers</span>
            <span className="text-gray-700">·</span>
            <span>Scope: {data.country}</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            <p className="text-sm text-gray-400">Resolving constraint layers…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-6 text-center">
            <p className="text-sm font-medium text-red-400 mb-1">Failed to load dashboard</p>
            <p className="text-xs text-red-300/70 mb-4">{error}</p>
            <button
              onClick={fetchDashboard}
              className="rounded-md border border-red-500/40 bg-red-900/30 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-900/50 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dashboard Grid */}
        {data && !loading && (
          <>
            {/* Reality root label */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-800" />
                <span className="text-xs font-mono uppercase tracking-widest text-gray-600">
                  Root: Reality — 5 Constraint Layers
                </span>
                <div className="h-px flex-1 bg-gray-800" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {data.constraints.map((constraint) => (
                <ConstraintCard key={constraint.id} constraint={constraint} />
              ))}
            </div>

            {/* Footer note */}
            <div className="mt-10 border-t border-gray-800 pt-6 text-center">
              <p className="text-xs text-gray-600">
                All signals computed from source data. No inference. No speculation.
                Signal engine: YoY · Rolling slope · Inflection · Z-score · MA divergence.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
