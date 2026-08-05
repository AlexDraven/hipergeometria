import { useState } from 'react'
import { formatProbability } from '../lib/format'

export interface CurvePoint {
  x: number
  y: number
}

interface CurveChartProps {
  points: CurvePoint[]
  /** Etiqueta bajo cada barra o punto (mulligans, turnos…). */
  xLabel: (x: number) => string
  /** Segunda línea opcional bajo la etiqueta (tamaño de mano…). */
  xSubLabel?: (x: number) => string | undefined
  ariaLabel: string
  /** Índice seleccionado por defecto (suele ser el último punto). */
  defaultSelected?: number
  /** Color de acento. */
  color?: string
}

const WIDTH = 640
const HEIGHT = 240
const PAD = { top: 34, right: 16, bottom: 36, left: 14 }
const DENSE_THRESHOLD = 12

const MONO = 'IBM Plex Mono, ui-monospace, Menlo, monospace'

export default function CurveChart({
  points,
  xLabel,
  xSubLabel,
  ariaLabel,
  defaultSelected,
  color = '#d2461f',
}: CurveChartProps) {
  const [selected, setSelected] = useState(() =>
    Math.max(0, Math.min(defaultSelected ?? points.length - 1, points.length - 1)),
  )

  if (points.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center font-mono text-sm text-ink-500">
        Ajusta los parámetros para ver la curva.
      </div>
    )
  }

  const clamped = Math.max(0, Math.min(selected, points.length - 1))
  const plotW = WIDTH - PAD.left - PAD.right
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const slot = plotW / points.length
  const barW = Math.min(slot * 0.62, 56)
  const gridLines = [0.25, 0.5, 0.75, 1]
  const dense = points.length > DENSE_THRESHOLD

  const xAt = (i: number) => PAD.left + i * slot + slot / 2
  const yAt = (p: number) => PAD.top + plotH * (1 - p)

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)} ${yAt(p.y).toFixed(1)}`)
    .join(' ')
  const areaPath = `${linePath} L${xAt(points.length - 1).toFixed(1)} ${PAD.top + plotH} L${xAt(0).toFixed(1)} ${PAD.top + plotH} Z`

  const tickEvery = dense ? Math.max(1, Math.ceil(points.length / 9)) : 1

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full"
      role="img"
      aria-label={ariaLabel}
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
              x={PAD.left + 4}
              y={y + 3}
              fontSize={10}
              fontFamily={MONO}
              fill="#7d7566"
            >
              {formatProbability(f, 2)}
            </text>
          </g>
        )
      })}

      {dense && (
        <>
          <path d={areaPath} fill={color} opacity={0.14} />
          <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
        </>
      )}

      {points.map((point, i) => {
        const isSelected = i === clamped
        const cx = xAt(i)
        const cy = yAt(point.y)
        const pillW = Math.max(52, 44)

        return (
          <g
            key={point.x}
            role="button"
            tabIndex={0}
            aria-label={`${xLabel(point.x)}: ${formatProbability(point.y, 6)}`}
            className="cursor-pointer"
            onClick={() => setSelected(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setSelected(i)
              }
            }}
          >
            <rect
              x={PAD.left + i * slot}
              y={PAD.top}
              width={slot}
              height={plotH}
              fill="transparent"
            >
              <title>{`${xLabel(point.x)}: ${formatProbability(point.y, 6)}`}</title>
            </rect>

            {!dense && (
              <rect
                x={xAt(i) - barW / 2}
                y={cy}
                width={barW}
                height={Math.max(PAD.top + plotH - cy, point.y > 0 ? 2 : 1)}
                rx={3}
                fill={isSelected ? color : '#3b3629'}
                className="transition-opacity"
              />
            )}

            {dense && (
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 5 : 3}
                fill={color}
                stroke={isSelected ? '#f4eee0' : 'none'}
                strokeWidth={1.5}
              />
            )}

            {isSelected && (
              <g>
                <rect
                  x={cx - pillW / 2}
                  y={Math.max(8, cy - 26)}
                  width={pillW}
                  height={20}
                  rx={3}
                  fill="#f4eee0"
                />
                <text
                  x={cx}
                  y={Math.max(22, cy - 12)}
                  textAnchor="middle"
                  fontSize={11}
                  fontFamily={MONO}
                  fontWeight={600}
                  fill="#1e1a14"
                >
                  {formatProbability(point.y, 5)}
                </text>
              </g>
            )}

            {i % tickEvery === 0 && (
              <text
                x={cx}
                y={HEIGHT - 14}
                textAnchor="middle"
                fontSize={dense ? 10 : 12}
                fontFamily={MONO}
                fontWeight={isSelected ? 600 : 500}
                fill={isSelected ? color : '#7d7566'}
              >
                {xLabel(point.x)}
              </text>
            )}
            {!dense &&
              xSubLabel &&
              (() => {
                const sub = xSubLabel(point.x)
                return sub ? (
                  <text
                    x={cx}
                    y={HEIGHT - 2}
                    textAnchor="middle"
                    fontSize={9}
                    fontFamily={MONO}
                    fill="#5c554a"
                  >
                    {sub}
                  </text>
                ) : null
              })()}
          </g>
        )
      })}
    </svg>
  )
}
