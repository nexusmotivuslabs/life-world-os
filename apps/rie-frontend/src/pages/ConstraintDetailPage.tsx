/**
 * Single Constraint of Life — data loaded when user selects an area.
 */
import { useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDashboardStore } from '../store/dashboardStore'
import { ConstraintCard } from '../components/ConstraintCard'
import { CONSTRAINTS_OF_LIFE } from '../config/constraintsOfLife'

const VALID_IDS = new Set(CONSTRAINTS_OF_LIFE.map((c) => c.id))

export function ConstraintDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { constraintDetail, loadingConstraint, errorConstraint, fetchConstraint, clearConstraintDetail } = useDashboardStore()

  useEffect(() => {
    if (!id || !VALID_IDS.has(id)) {
      navigate('/', { replace: true })
      return
    }
    clearConstraintDetail()
    fetchConstraint(id)
  }, [id, fetchConstraint, clearConstraintDetail, navigate])

  if (!id || !VALID_IDS.has(id)) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
            >
              ← Constraints of Life
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-500/20 border border-orange-500/30">
              <span className="text-sm font-bold text-orange-400">R</span>
            </div>
            <span className="text-sm text-gray-500 capitalize">{id}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {loadingConstraint && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            <p className="text-sm text-gray-400">Loading constraint data…</p>
          </div>
        )}

        {errorConstraint && !loadingConstraint && (
          <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-6 text-center">
            <p className="text-sm font-medium text-red-400 mb-1">Failed to load this constraint</p>
            <p className="text-xs text-red-300/70 mb-4">{errorConstraint}</p>
            <Link
              to="/"
              className="inline-block rounded-md border border-red-500/40 bg-red-900/30 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-900/50 transition-colors"
            >
              Back to Constraints of Life
            </Link>
          </div>
        )}

        {constraintDetail && !loadingConstraint && (
          <div className="max-w-4xl mx-auto">
            <ConstraintCard constraint={constraintDetail} />
          </div>
        )}
      </main>
    </div>
  )
}
