/**
 * Constraints of Life — area selector.
 * User selects an area first; data is then loaded on the detail page.
 */
import { Link } from 'react-router-dom'
import { CONSTRAINTS_OF_LIFE } from '../config/constraintsOfLife'

const LAYER_COLORS: Record<number, string> = {
  1: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  2: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  3: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  4: 'border-violet-500/40 bg-violet-500/10 text-violet-400',
  5: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
}

export function ConstraintsOfLifeSelector() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-500/20 border border-orange-500/30">
              <span className="text-sm font-bold text-orange-400">R</span>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-none">
                Reality Intelligence Engine
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                The five constraints of life — UK macro signals and early warning
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 text-center">
          <h2 className="text-lg font-semibold text-gray-300 uppercase tracking-widest">
            Constraints of Life
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-xl mx-auto">
            Select an area to load structural metrics, signals, and strategic thesis for that sector.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {CONSTRAINTS_OF_LIFE.map((c) => {
            const style = LAYER_COLORS[c.layer] ?? 'border-gray-600 bg-gray-800/50 text-gray-300'
            return (
              <Link
                key={c.id}
                to={`/constraint/${c.id}`}
                className={`flex flex-col rounded-xl border p-5 transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${style}`}
              >
                <span className="text-xs font-mono uppercase tracking-widest opacity-80">
                  Layer {c.layer}
                </span>
                <h3 className="mt-1 text-lg font-bold">{c.name}</h3>
                <p className="mt-2 text-xs opacity-90 leading-relaxed">
                  {c.shortDescription}
                </p>
                <span className="mt-4 text-xs font-medium opacity-80">View data →</span>
              </Link>
            )
          })}
        </div>

        <p className="mt-10 text-center text-xs text-gray-600">
          Physical · Biological · Economic · Informational · Social
        </p>
      </main>
    </div>
  )
}
