/**
 * SkillsMapChart
 *
 * Redesigned for instant readability, low cognitive load, and decision-orientation.
 * Two views: Quadrant (X = System Leverage, Y = Compounding Power) and Spectrum
 * (single axis: Radio → Gamma). Full skill names in a list; chart shows position.
 * Click any skill for next-step decision (Invest / Maintain / Avoid).
 */

import { useState, useCallback } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ZAxis,
} from 'recharts'
import type { SkillsMapSkill, SkillsMapSystemConfig } from '../config/skillsMapConfig'
import { SKILLS_MAP_SCALE } from '../config/skillsMapConfig'

const GRADIENT_ID = 'skills-map-red-green-gradient'
const SPECTRUM_GRADIENT_ID = 'skills-map-spectrum-gradient'

const DOMAIN_PAD = 1
const PLOT_DOMAIN_X: [number, number] = [SKILLS_MAP_SCALE.min - DOMAIN_PAD, SKILLS_MAP_SCALE.max + DOMAIN_PAD]
const PLOT_DOMAIN_Y: [number, number] = [SKILLS_MAP_SCALE.min - DOMAIN_PAD, SKILLS_MAP_SCALE.max + DOMAIN_PAD]

export type SkillsMapViewMode = 'quadrant' | 'spectrum'

export interface SkillsMapChartProps {
  config: SkillsMapSystemConfig
  color?: string
  onSkillClick: (skill: SkillsMapSkill) => void
}

type ScatterPointPayload = SkillsMapSkill & { x: number; y: number; name: string; index?: number }

/** Single-line tooltip: description if present, otherwise label (no duplication). */
function SkillTooltipContent({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload?: ScatterPointPayload }>
}) {
  if (!active || !payload?.length) return null
  const s = payload[0]?.payload
  if (!s) return null
  const text = s.description ?? s.label
  return (
    <div className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-200 shadow-lg">
      {text}
    </div>
  )
}

const CIRCLE_R = 18
const CIRCLE_R_ACTIVE = 26
const LABEL_OFFSET = 10
const LABEL_FONT_SIZE = 12
const LABEL_MAX_LEN = 24
const MID = SKILLS_MAP_SCALE.max / 2

/** Truncate for on-chart label; keep full name readable (reference: ticker under stock circle). */
function truncateForChart(label: string, maxLen: number = LABEL_MAX_LEN): string {
  if (label.length <= maxLen) return label
  return label.slice(0, maxLen).trim() + '…'
}

/** Zone for decision: top-right = focus first, bottom-left = lower priority. */
export type QuadrantZone = 'high-impact' | 'leverage' | 'compounding' | 'lower-priority'

function getZone(skill: SkillsMapSkill): QuadrantZone {
  const { x, y } = skill
  if (x >= MID && y >= MID) return 'high-impact'
  if (x >= MID && y < MID) return 'leverage'
  if (x < MID && y >= MID) return 'compounding'
  return 'lower-priority'
}

function zoneLabel(zone: QuadrantZone): string {
  switch (zone) {
    case 'high-impact':
      return 'Focus here'
    case 'leverage':
      return 'Leverage'
    case 'compounding':
      return 'Compounding'
    case 'lower-priority':
      return 'Later'
    default:
      return ''
  }
}

function zoneBadgeClass(zone: QuadrantZone): string {
  switch (zone) {
    case 'high-impact':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    case 'leverage':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/40'
    case 'compounding':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    case 'lower-priority':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/40'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}

/** Chart point with skill name below (reference: ticker under stock). Hover = highlight, click = full description. */
function SkillPoint({
  cx,
  cy,
  payload,
  onClick,
  onHover,
  color,
  isActive,
}: {
  cx?: number
  cy?: number
  payload?: ScatterPointPayload
  onClick: (skill: SkillsMapSkill) => void
  onHover: (index: number | null) => void
  color: string
  isActive?: boolean
}) {
  if (cx == null || cy == null || !payload) return null
  const skill: SkillsMapSkill = {
    id: payload.id,
    label: payload.label,
    x: payload.x,
    y: payload.y,
    realityNodeId: payload.realityNodeId,
    description: payload.description,
  }
  const r = isActive ? CIRCLE_R_ACTIVE : CIRCLE_R
  const index = payload.index ?? 0
  const labelY = cy + r + LABEL_OFFSET
  const labelText = truncateForChart(skill.label)
  return (
    <g
      className="cursor-pointer transition-all duration-200"
      onClick={() => onClick(skill)}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(skill)}
      role="button"
      tabIndex={0}
      aria-label={`${skill.label}. Click for full description.`}
      style={{ outline: 'none' }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={color}
        fillOpacity={isActive ? 1 : 0.9}
        stroke={isActive ? '#ffffff' : 'rgba(255,255,255,0.4)'}
        strokeWidth={isActive ? 4 : 1.5}
        style={{
          filter: isActive ? 'drop-shadow(0 0 12px rgba(255,255,255,0.7))' : undefined,
        }}
      />
      <text
        x={cx}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="hanging"
        fill={isActive ? '#ffffff' : '#e5e7eb'}
        fontSize={LABEL_FONT_SIZE}
        fontWeight={isActive ? 700 : 600}
        className="pointer-events-none select-none"
        style={{
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
        }}
      >
        {labelText}
      </text>
    </g>
  )
}

const TAILWIND_ACCENT_HEX: Record<string, string> = {
  'text-blue-400': '#60a5fa',
  'text-pink-400': '#f472b6',
  'text-amber-400': '#fbbf24',
  'text-indigo-400': '#818cf8',
  'text-emerald-400': '#34d399',
  'text-cyan-400': '#22d3ee',
  'text-green-400': '#34d399',
  'text-purple-400': '#a78bfa',
}

function resolveAccentFill(color: string): string {
  return TAILWIND_ACCENT_HEX[color] ?? (color.startsWith('#') ? color : '#60a5fa')
}

function spectrumPosition(skill: SkillsMapSkill): number {
  return skill.x + skill.y
}

/** Decision-oriented list: full names, zone, scores. Click row = explore. */
function SkillListByZone({
  skills,
  onSkillClick,
  zoneOrder,
}: {
  skills: SkillsMapSkill[]
  onSkillClick: (skill: SkillsMapSkill) => void
  zoneOrder: QuadrantZone[]
}) {
  const byZone = skills.reduce<Record<QuadrantZone, SkillsMapSkill[]>>(
    (acc, s) => {
      const z = getZone(s)
      if (!acc[z]) acc[z] = []
      acc[z].push(s)
      return acc
    },
    {} as Record<QuadrantZone, SkillsMapSkill[]>
  )

  return (
    <div className="rounded-lg border border-gray-600/50 bg-gray-900/40 p-3 lg:min-w-[240px]">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">Skills by impact zone</p>
      <div className="space-y-3 max-h-[40vh] overflow-y-auto lg:max-h-none">
        {zoneOrder.map((zone) => {
          const list = byZone[zone] ?? []
          if (list.length === 0) return null
          return (
            <div key={zone}>
              <span className={`mb-1.5 inline-block rounded border px-2 py-0.5 text-xs font-medium ${zoneBadgeClass(zone)}`}>
                {zoneLabel(zone)}
              </span>
              <ul className="space-y-1">
                {list.map((skill) => (
                  <li key={skill.id}>
                    <button
                      type="button"
                      onClick={() => onSkillClick(skill)}
                      className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm text-gray-200 hover:bg-gray-700/60 hover:text-white"
                    >
                      <span className="min-w-0 flex-1 truncate" title={skill.label}>
                        {skill.label}
                      </span>
                      <span className="ml-2 shrink-0 text-xs text-gray-500">
                        {skill.x} / {skill.y}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Spectrum: full-width bar + grid of skills. */
function SkillsSpectrumView({
  skills,
  color,
  onSkillClick,
  onHover,
  hoveredIndex,
}: {
  skills: SkillsMapSkill[]
  color: string
  onSkillClick: (skill: SkillsMapSkill) => void
  onHover: (index: number | null) => void
  hoveredIndex: number | null
}) {
  const fillColor = resolveAccentFill(color)
  const sorted = [...skills]
    .map((s, i) => ({ skill: s, index: i, power: spectrumPosition(s) }))
    .sort((a, b) => a.power - b.power)
  const min = 0
  const max = SKILLS_MAP_SCALE.max * 2
  const barHeight = 40
  const barY = 20

  return (
    <div className="flex w-full min-w-0 flex-col">
      <div className="mb-2 flex justify-between text-xs text-gray-400">
        <span>Radio — low impact</span>
        <span>Gamma — high impact</span>
      </div>
      {/* Full-width spectrum bar: use a wrapper that fills width and pass % for circles via container ref or use SVG 100% */}
      <div className="relative w-full" style={{ height: barY + barHeight + 52 }}>
        <svg width="100%" height={barY + barHeight + 52} preserveAspectRatio="none" className="overflow-visible" viewBox={`0 0 1000 ${barY + barHeight + 52}`}>
          <defs>
            <linearGradient id={SPECTRUM_GRADIENT_ID} x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(185, 28, 28, 0.55)" />
              <stop offset="50%" stopColor="rgba(75, 85, 99, 0.4)" />
              <stop offset="100%" stopColor="rgba(22, 163, 74, 0.55)" />
            </linearGradient>
          </defs>
          <rect x={0} y={barY} width={1000} height={barHeight} fill={`url(#${SPECTRUM_GRADIENT_ID})`} rx={8} />
          {sorted.map(({ skill, index, power }) => {
            const pct = (power - min) / (max - min)
            const cx = pct * 1000
            const isActive = hoveredIndex === index
            const r = isActive ? 14 : 11
            const labelY = barY + barHeight / 2 + r + 6
            const spectrumLabel = truncateForChart(skill.label, 18)
            return (
              <g
                key={skill.id}
                className="cursor-pointer transition-all duration-150"
                onClick={() => onSkillClick(skill)}
                onMouseEnter={() => onHover(index)}
                onMouseLeave={() => onHover(null)}
                style={{ outline: 'none' }}
              >
                <circle
                  cy={barY + barHeight / 2}
                  cx={cx}
                  r={r}
                  fill={fillColor}
                  fillOpacity={isActive ? 1 : 0.9}
                  stroke={isActive ? '#ffffff' : 'rgba(255,255,255,0.4)'}
                  strokeWidth={isActive ? 4 : 1.5}
                  style={{ filter: isActive ? 'drop-shadow(0 0 10px rgba(255,255,255,0.6))' : undefined }}
                />
                <text
                  x={cx}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="hanging"
                  fill={isActive ? '#ffffff' : '#e5e7eb'}
                  fontSize={11}
                  fontWeight={isActive ? 700 : 600}
                  className="pointer-events-none select-none"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                >
                  {spectrumLabel}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      {/* Full names in responsive grid — no truncation */}
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map(({ skill, index }) => (
          <li key={skill.id}>
            <button
              type="button"
              onClick={() => onSkillClick(skill)}
              onMouseEnter={() => onHover(index)}
              onMouseLeave={() => onHover(null)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                hoveredIndex === index ? 'bg-gray-700/70 text-white' : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: fillColor }} aria-hidden />
              <span className="min-w-0 flex-1 break-words" title={skill.label}>
                {skill.label}
              </span>
              <span className="shrink-0 text-xs text-gray-500">{(skill.x + skill.y).toFixed(0)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ZONE_ORDER: QuadrantZone[] = ['high-impact', 'leverage', 'compounding', 'lower-priority']

export default function SkillsMapChart({ config, color = '#3b82f6', onSkillClick }: SkillsMapChartProps) {
  const [viewMode, setViewMode] = useState<SkillsMapViewMode>('quadrant')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const { axisLabels, skills } = config
  const data = skills.map((s, i) => ({ ...s, x: s.x, y: s.y, name: s.label, index: i }))
  const fillColor = resolveAccentFill(color)

  const xAxisTickFormatter = useCallback(
    (value: number) => {
      if (value === SKILLS_MAP_SCALE.min) return '0'
      if (value === MID) return '5'
      if (value === SKILLS_MAP_SCALE.max) return '10'
      return String(value)
    },
    []
  )
  const yAxisTickFormatter = useCallback(
    (value: number) => {
      if (value === SKILLS_MAP_SCALE.min) return '0'
      if (value === MID) return '5'
      if (value === SKILLS_MAP_SCALE.max) return '10'
      return String(value)
    },
    []
  )

  return (
    <div className="flex w-full max-w-full min-w-0 flex-col rounded-xl border border-gray-600/50 bg-gray-800/40 p-4 shadow-inner sm:p-5 lg:min-h-[75vh]">
      <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white sm:text-lg">
            {viewMode === 'quadrant'
              ? `${axisLabels.x} × ${axisLabels.y}`
              : 'Impact spectrum (Radio → Gamma)'}
          </h3>
        </div>
        <div className="flex rounded-lg border border-gray-600 bg-gray-800/80 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('quadrant')}
            className={`rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              viewMode === 'quadrant' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Quadrant
          </button>
          <button
            type="button"
            onClick={() => setViewMode('spectrum')}
            className={`rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              viewMode === 'spectrum' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Spectrum
          </button>
        </div>
      </div>

      {viewMode === 'spectrum' ? (
        <div className="min-w-0 flex-1">
          <SkillsSpectrumView
            skills={skills}
            color={color}
            onSkillClick={onSkillClick}
            onHover={setHoveredIndex}
            hoveredIndex={hoveredIndex}
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
          <div className="h-[55vh] min-h-[420px] max-h-[720px] min-w-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 72, left: 40 }}
                style={{ overflow: 'visible' }}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={(nextState: { activePayload?: Array<{ payload?: ScatterPointPayload }>; activeTooltipIndex?: number }) => {
                  const payload = nextState?.activePayload?.[0]?.payload
                  const index = nextState?.activeTooltipIndex ?? 0
                  const skill = payload
                    ? (config.skills.find((s) => s.id === payload.id) ?? config.skills[index])
                    : config.skills[index]
                  if (skill) onSkillClick(skill)
                }}
              >
                <defs>
                  <linearGradient
                    id={GRADIENT_ID}
                    x1="0"
                    y1="1"
                    x2="1"
                    y2="0"
                    gradientUnits="objectBoundingBox"
                  >
                    <stop offset="0%" stopColor="rgba(185, 28, 28, 0.4)" />
                    <stop offset="50%" stopColor="rgba(75, 85, 99, 0.15)" />
                    <stop offset="100%" stopColor="rgba(22, 163, 74, 0.4)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" strokeOpacity={0.3} />
                <ReferenceArea
                  x1={PLOT_DOMAIN_X[0]}
                  x2={PLOT_DOMAIN_X[1]}
                  y1={PLOT_DOMAIN_Y[0]}
                  y2={PLOT_DOMAIN_Y[1]}
                  fill={`url(#${GRADIENT_ID})`}
                />
                <XAxis
                  type="number"
                  dataKey="x"
                  name={axisLabels.x}
                  domain={PLOT_DOMAIN_X}
                  ticks={[0, 5, 10]}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={xAxisTickFormatter}
                  tickLine={{ stroke: '#4b5563', strokeOpacity: 0.7 }}
                  axisLine={{ stroke: '#4b5563', strokeOpacity: 0.8 }}
                  label={{ value: axisLabels.x, position: 'bottom', fill: '#9ca3af', fontSize: 11 }}
                  allowDataOverflow
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name={axisLabels.y}
                  domain={PLOT_DOMAIN_Y}
                  ticks={[0, 5, 10]}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={yAxisTickFormatter}
                  tickLine={{ stroke: '#4b5563', strokeOpacity: 0.7 }}
                  axisLine={{ stroke: '#4b5563', strokeOpacity: 0.8 }}
                  label={{ value: axisLabels.y, angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 11 }}
                  allowDataOverflow
                />
                <ZAxis type="number" range={[50, 50]} />
                <Tooltip
                  content={<SkillTooltipContent />}
                  cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4', strokeOpacity: 0.6 }}
                />
                <Scatter
                  name="Skills"
                  data={data}
                  isAnimationActive={false}
                  activeIndex={hoveredIndex ?? undefined}
                  activeShape={(props) => (
                    <SkillPoint
                      {...props}
                      isActive
                      onClick={onSkillClick}
                      onHover={setHoveredIndex}
                      color={fillColor}
                    />
                  )}
                  onClick={(entry: unknown, index: number) => {
                    const point = entry as ScatterPointPayload
                    const skill = config.skills.find((s) => s.id === point?.id) ?? config.skills[index]
                    if (skill) onSkillClick(skill)
                  }}
                  shape={(props) => (
                    <SkillPoint
                      {...props}
                      onClick={onSkillClick}
                      onHover={setHoveredIndex}
                      color={fillColor}
                    />
                  )}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <aside className="w-full shrink-0 lg:w-72">
            <SkillListByZone skills={skills} onSkillClick={onSkillClick} zoneOrder={ZONE_ORDER} />
          </aside>
        </div>
      )}
    </div>
  )
}
