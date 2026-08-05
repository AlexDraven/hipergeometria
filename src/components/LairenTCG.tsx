import { useMemo } from 'react'
import {
  DEFAULT_HAND_SIZES,
  lairenDraftSingle,
  lairenMulliganCurve,
} from '../lib/lairen'
import { formatProbability } from '../lib/format'
import CurveChart from './CurveChart'
import Tooltip from './Tooltip'
import type { CurvePoint } from './CurveChart'

const INPUT_CLASS =
  'w-full rounded border border-felt-600 bg-felt-950/60 px-2 py-1 text-sm text-ink-100 outline-none transition focus:border-signal-500/70'

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.round(value)))
}

interface LairenTCGProps {
  N: number
  K: number
  onChange: (params: { N: number; K: number }) => void
}

function Stat({
  label,
  value,
  highlight = false,
  tooltip,
}: {
  label: string
  value: string
  highlight?: boolean
  tooltip?: string
}) {
  return (
    <div
      className={`rounded border px-3 py-2.5 ${
        highlight ? 'border-signal-500/50 bg-signal-500/10' : 'border-felt-600'
      }`}
    >
      <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
        <span>{label}</span>
        {tooltip && <Tooltip text={tooltip} />}
      </p>
      <p
        className={`mt-1 font-mono text-lg font-semibold tabular-nums ${
          highlight ? 'text-signal-400' : 'text-ink-100'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

export default function LairenTCG({ N, K, onChange }: LairenTCGProps) {
  const curve = useMemo(
    () => lairenMulliganCurve(N, K, DEFAULT_HAND_SIZES),
    [N, K],
  )
  const draftSingle = useMemo(() => lairenDraftSingle(N, K), [N, K])

  const curvePoints: CurvePoint[] = curve.map((p) => ({ x: p.m, y: p.cumulative }))
  const finalCumulative = curve[curve.length - 1]?.cumulative ?? NaN

  return (
    <div>
      <section className="mb-8">
        <p className="mb-3 flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-ink-400">
          <span className="h-px w-8 bg-signal-500" />
          LairenTCG
        </p>
        <h2 className="font-display text-3xl font-semibold leading-none tracking-tight text-ink-100 sm:text-4xl">
          Mulligan de <span className="italic">Lairen</span>
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-400">
          Con solo dos números: las cartas del mazo y las copias de tu carta. En
          Lairen se roban 7 cartas y se ponen algunas al fondo del mazo, así que
          la mano con la que empezás cambia en cada intento.
        </p>
      </section>

      <section className="panel p-6" aria-label="Mulligan de Lairen">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="panel-title">Mulligan</h3>
          <span className="rounded border border-felt-600 px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-ink-400">
            manos: {DEFAULT_HAND_SIZES.join(' · ')}
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="lairen-N" className="text-sm font-medium text-ink-200">
              Cartas en el mazo (N)
            </label>
            <input
              id="lairen-N"
              type="number"
              min={1}
              max={200}
              value={N}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (Number.isInteger(v)) onChange({ N: clamp(v, 1, 200), K })
              }}
              className={`${INPUT_CLASS} text-right tabular-nums`}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="lairen-K" className="text-sm font-medium text-ink-200">
              Copias de la carta (K)
            </label>
            <input
              id="lairen-K"
              type="number"
              min={0}
              max={N}
              value={K}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (Number.isInteger(v)) onChange({ N, K: clamp(v, 0, N) })
              }}
              className={`${INPUT_CLASS} text-right tabular-nums`}
            />
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-ink-500">
          En cada intento se roban 7 cartas y se ponen algunas al fondo del mazo:
          te quedan 6, 6, 5, 4, 3 y 2 cartas según los mulligans que hagas.
        </p>

        <div className="mt-5">
          <CurveChart
            points={curvePoints}
            xLabel={(m) => `${m}`}
            xSubLabel={(m) => `${DEFAULT_HAND_SIZES[m]}`}
            ariaLabel="Probabilidad acumulada de robar la carta tras cada mulligan"
            defaultSelected={curve.length - 1}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Stat
            label="Robar 7 cartas"
            value={formatProbability(draftSingle, 5)}
            tooltip="Probabilidad de ver la carta entre las 7 cartas que robás."
          />
          <Stat
            label="Después de 5 mulligans"
            value={formatProbability(finalCumulative, 5)}
            highlight
            tooltip="Probabilidad acumulada de tener la carta tras usar los 5 mulligans."
          />
        </div>
      </section>
    </div>
  )
}
