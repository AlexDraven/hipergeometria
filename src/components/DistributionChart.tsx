import type { DistributionPoint } from '../lib/hypergeometric'
import { formatProbability } from '../lib/format'

interface DistributionChartProps {
  points: DistributionPoint[]
  selectedK: number
  onSelect: (k: number) => void
}

const WIDTH = 640
const HEIGHT = 280
const PAD = { top: 24, right: 16, bottom: 36, left: 48 }

export default function DistributionChart({
  points,
  selectedK,
  onSelect,
}: DistributionChartProps) {
  if (points.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-mist-400">
        Sin datos para mostrar.
      </div>
    )
  }

  const maxP = Math.max(...points.map((p) => p.p), 1e-9)
  const plotW = WIDTH - PAD.left - PAD.right
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const slot = plotW / points.length
  const barW = Math.min(slot * 0.72, 64)
  const gridLines = [0.25, 0.5, 0.75, 1]

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full"
      role="img"
      aria-label="Distribución hipergeométrica"
    >
      {gridLines.map((f) => {
        const y = PAD.top + plotH * (1 - f)
        return (
          <g key={f}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="4 4"
            />
            <text
              x={PAD.left - 8}
              y={y + 4}
              textAnchor="end"
              fontSize={11}
              fill="#9d8fc0"
            >
              {formatProbability(maxP * f, 4)}
            </text>
          </g>
        )
      })}

      {points.map((point, i) => {
        const selected = point.k === selectedK
        const x = PAD.left + i * slot + (slot - barW) / 2
        const h = Math.max((point.p / maxP) * plotH, point.p > 0 ? 2 : 1)
        const y = PAD.top + plotH - h
        const gradientId = `bar-${selected ? 'sel' : 'base'}`

        return (
          <g key={point.k} onClick={() => onSelect(point.k)} className="cursor-pointer">
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={6}
              fill={`url(#${gradientId})`}
              opacity={selected ? 1 : 0.75}
              className={`bar-animate transition ${selected ? '' : 'hover:opacity-100'}`}
            />
            <rect
              x={PAD.left + i * slot}
              y={PAD.top}
              width={slot}
              height={plotH}
              fill="transparent"
            >
              <title>{`k = ${point.k}: ${formatProbability(point.p, 6)}`}</title>
            </rect>

            {selected && (
              <g>
                <rect
                  x={x - 6}
                  y={Math.max(8, y - 30)}
                  width={barW + 12}
                  height={22}
                  rx={6}
                  fill="#fbbf24"
                />
                <text
                  x={x + barW / 2}
                  y={Math.max(24, y - 14)}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={700}
                  fill="#0d0a1a"
                >
                  {formatProbability(point.p, 5)}
                </text>
              </g>
            )}

            <text
              x={x + barW / 2}
              y={HEIGHT - 12}
              textAnchor="middle"
              fontSize={12}
              fontWeight={selected ? 700 : 500}
              fill={selected ? '#fcd34d' : '#9d8fc0'}
            >
              {point.k}
            </text>
          </g>
        )
      })}

      <defs>
        <linearGradient id="bar-base" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="bar-sel" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
    </svg>
  )
}
