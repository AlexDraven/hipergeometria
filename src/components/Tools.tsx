import { useMemo, useState } from 'react'
import {
  comboProbability,
  drawCurve,
  minimumCopies,
} from '../lib/hypergeometric'
import { formatProbability } from '../lib/format'
import CurveChart from './CurveChart'
import type { CurvePoint } from './CurveChart'

const INPUT_CLASS =
  'w-full rounded border border-felt-600 bg-felt-950/60 px-2 py-1 text-sm text-ink-100 outline-none transition focus:border-signal-500/70'

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.round(value)))
}

interface ToolsProps {
  N: number
  K: number
  n: number
}

export default function Tools({ N, K, n }: ToolsProps) {
  return (
    <section className="mt-6" aria-label="Herramientas">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h2 className="panel-title">Herramientas</h2>
        <p className="font-mono text-[11px] text-ink-500">
          Reutilizan N, K y n del panel Mazo
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ComboPanel N={N} n={n} />
        <MinCopiesPanel N={N} n={n} />
        <TurnCurvePanel N={N} K={K} />
      </div>
    </section>
  )
}

function NumField({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink-200">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value)
          if (Number.isInteger(v)) onChange(clamp(v, min, max))
        }}
        className={`${INPUT_CLASS} text-right tabular-nums`}
      />
    </div>
  )
}

function ComboPanel({ N, n }: { N: number; n: number }) {
  const [a, setA] = useState(4)
  const [b, setB] = useState(4)
  const [c, setC] = useState(0)
  const [draws, setDraws] = useState(n)

  const ks = [a, b, c].filter((k) => k > 0)

  const prob = useMemo(
    () => (ks.length === 0 ? NaN : comboProbability(N, ks, draws)),
    [N, ks, draws],
  )

  const curve: CurvePoint[] = useMemo(() => {
    const points: CurvePoint[] = []
    for (let d = 0; d <= N; d++) {
      points.push({ x: d, y: comboProbability(N, ks, d) })
    }
    return points
  }, [N, ks])

  return (
    <section className="panel p-6" aria-label="Combo">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="panel-title">Combo · robar varias cartas juntas</h3>
        <span className="rounded border border-felt-600 px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-ink-400">
          mazo de {N}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <NumField id="combo-A" label="Copias A" value={a} min={0} max={N} onChange={setA} />
        <NumField id="combo-B" label="Copias B" value={b} min={0} max={N} onChange={setB} />
        <NumField id="combo-C" label="Copias C" value={c} min={0} max={N} onChange={setC} />
        <NumField id="combo-n" label="Cartas robadas" value={draws} min={0} max={N} onChange={setDraws} />
      </div>
      <p className="mt-2 text-xs text-ink-500">Poné 0 en las cartas que no uses.</p>

      <p className="mt-5 font-display text-4xl font-semibold leading-none tracking-tight text-ink-100">
        {Number.isNaN(prob) ? '—' : formatProbability(prob, 5)}
      </p>
      <p className="mt-1 text-xs text-ink-500">
        Probabilidad de tener al menos 1 de cada carta al robar {draws} de {N}.
      </p>

      <div className="mt-5">
        {ks.length === 0 ? (
          <div className="flex h-56 items-center justify-center font-mono text-sm text-ink-500">
            Agregá al menos una carta para ver la curva.
          </div>
        ) : (
          <CurveChart
            points={curve}
            xLabel={(d) => `${d}`}
            ariaLabel="Probabilidad del combo según las cartas robadas"
            defaultSelected={curve.length - 1}
          />
        )}
      </div>
    </section>
  )
}

function MinCopiesPanel({ N, n }: { N: number; n: number }) {
  const [draws, setDraws] = useState(n)
  const [target, setTarget] = useState(50)

  const result = useMemo(
    () => minimumCopies(N, draws, target / 100),
    [N, draws, target],
  )

  return (
    <section className="panel p-6" aria-label="Copias necesarias">
      <div className="mb-4">
        <h3 className="panel-title">Copias necesarias</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumField
          id="mincopies-n"
          label="Cartas robadas (n)"
          value={draws}
          min={0}
          max={N}
          onChange={setDraws}
        />
        <NumField
          id="mincopies-target"
          label="Probabilidad objetivo (%)"
          value={target}
          min={1}
          max={100}
          onChange={setTarget}
        />
      </div>

      <p className="mt-5 font-display text-4xl font-semibold leading-none tracking-tight text-ink-100">
        {result.copies} {result.copies === 1 ? 'copia' : 'copias'}
      </p>
      <p className="mt-1 text-xs text-ink-500">
        Mínimo para alcanzar {target}% al robar {draws} de {N} (logra{' '}
        {formatProbability(result.probability, 4)}).
      </p>
    </section>
  )
}

function TurnCurvePanel({ N, K }: { N: number; K: number }) {
  const [perTurn, setPerTurn] = useState(1)

  const curve = useMemo(() => drawCurve(N, K, perTurn), [N, K, perTurn])
  const points: CurvePoint[] = curve.map((p) => ({ x: p.t, y: p.cumulative }))

  return (
    <section className="panel p-6 lg:col-span-2" aria-label="Curva por turnos">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="panel-title">Curva por turnos</h3>
        <div className="w-40">
          <NumField
            id="turncurve-per"
            label="Cartas robadas por turno"
            value={perTurn}
            min={1}
            max={N}
            onChange={setPerTurn}
          />
        </div>
      </div>

      <CurveChart
        points={points}
        xLabel={(t) => `${t}`}
        ariaLabel="Probabilidad acumulada de tener la carta en cada turno"
        defaultSelected={points.length - 1}
      />
      <p className="mt-2 text-xs text-ink-500">
        Probabilidad de tener al menos 1 de las {K} copias en el turno t, robando{' '}
        {perTurn} carta{perTurn === 1 ? '' : 's'} por turno.
      </p>
    </section>
  )
}
