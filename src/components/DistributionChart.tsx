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

const MONO = 'IBM Plex Mono, ui-monospace, Menlo, monospace'

export default function DistributionChart({
  points,
  selectedK,
  onSelect,
}: DistributionChartProps) {
  if (points.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center font-mono text-sm text-ink-500">
        Ajusta los parámetros para ver la distribución.
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
              stroke="rgba(205,196,178,0.12)"
              strokeDasharray="4 4"
            />
            <text
              x={PAD.left - 8}
              y={y + 4}
              textAnchor="end"
              fontSize={11}
              fontFamily={MONO}
              fill="#7d7566"
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

        return (
          <g
            key={point.k}
            role="button"
            tabIndex={0}
            aria-label={`k = ${point.k}, ${formatProbability(point.p, 6)}`}
            className="cursor-pointer"
            onClick={() => onSelect(point.k)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(point.k)
              }
            }}
          >
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={3}
              fill={selected ? '#d2461f' : '#3b3629'}
              opacity={selected ? 1 : 0.9}
              className={`bar-animate transition-opacity ${selected ? '' : 'hover:opacity-100'}`}
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
                  y={Math.max(8, y - 28)}
                  width={barW + 12}
                  height={20}
                  rx={3}
                  fill="#f4eee0"
                />
                <text
                  x={x + barW / 2}
                  y={Math.max(22, y - 14)}
                  textAnchor="middle"
                  fontSize={11}
                  fontFamily={MONO}
                  fontWeight={600}
                  fill="#1e1a14"
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
              fontFamily={MONO}
              fontWeight={selected ? 600 : 500}
              fill={selected ? '#d2461f' : '#7d7566'}
            >
              {point.k}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
