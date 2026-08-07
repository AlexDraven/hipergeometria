import {
  hypergeometricCdfAtLeast,
  hypergeometricCdfAtMost,
  type DistributionPoint,
} from '../lib/hypergeometric'
import { formatProbability } from '../lib/format'
import Tooltip from './Tooltip'

interface ProbabilityTableProps {
  points: DistributionPoint[]
  selectedK: number
  N: number
  K: number
  n: number
}

export default function ProbabilityTable({
  points,
  selectedK,
  N,
  K,
  n,
}: ProbabilityTableProps) {
  const maxExact = Math.max(...points.map((p) => p.p), 0)

  return (
    <div>
      <p className="mb-4 max-w-2xl text-xs leading-relaxed text-ink-400">
        Cada fila es un valor de{' '}
        <strong className="font-semibold text-ink-200">k</strong>: cuántas copias
        de tu carta querés tener. Las columnas muestran qué tan probable es robar
        <strong className="font-semibold text-ink-200"> exactamente </strong>esa
        cantidad, <strong className="font-semibold text-ink-200">al menos</strong>{' '}
        esa cantidad o <strong className="font-semibold text-ink-200">a lo sumo</strong>{' '}
        esa cantidad.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-felt-600">
              <th className="py-3 pr-4 text-left">
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  Copias
                  <Tooltip text="Cantidad de copias de tu carta que querés tener en la mano." direction="bottom" align="left" />
                </span>
                <span className="mt-0.5 block font-mono text-[10px] text-ink-600">k</span>
              </th>
              <th className="py-3 pr-4 text-right">
                <span className="flex items-center justify-end gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  Exactas
                  <Tooltip text="Probabilidad de robar exactamente k copias de tu carta." direction="bottom" align="right" />
                </span>
                <span className="mt-0.5 block font-mono text-[10px] text-ink-600">P(X = k)</span>
              </th>
              <th className="py-3 pr-4 text-right">
                <span className="flex items-center justify-end gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  Al menos
                  <Tooltip text="Probabilidad de robar k copias o más de tu carta." direction="bottom" align="right" />
                </span>
                <span className="mt-0.5 block font-mono text-[10px] text-ink-600">P(X ≥ k)</span>
              </th>
              <th className="py-3 text-right">
                <span className="flex items-center justify-end gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  A lo sumo
                  <Tooltip text="Probabilidad de robar k copias o menos de tu carta." direction="bottom" align="right" />
                </span>
                <span className="mt-0.5 block font-mono text-[10px] text-ink-600">P(X ≤ k)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => {
              const selected = point.k === selectedK
              const atLeast = hypergeometricCdfAtLeast({ N, K, n, k: point.k })
              const atMost = hypergeometricCdfAtMost({ N, K, n, k: point.k })
              const barWidth = maxExact > 0 ? (point.p / maxExact) * 100 : 0
              return (
                <tr
                  key={point.k}
                  className={`border-b border-felt-700/70 transition ${
                    selected
                      ? 'border-l-2 border-l-signal-500 bg-signal-500/10 text-ink-100'
                      : 'text-ink-300 hover:bg-felt-800/60'
                  }`}
                >
                  <td className="py-2.5 pr-4">
                    <span
                      className={`inline-flex h-6 min-w-6 items-center justify-center rounded px-1.5 font-mono text-xs font-semibold ${
                        selected
                          ? 'bg-signal-500 text-paper'
                          : 'bg-felt-700 text-ink-300'
                      }`}
                    >
                      {point.k}
                    </span>
                  </td>
                  <td className="relative py-2.5 pr-4 text-right">
                    {barWidth > 0 && (
                      <span
                        aria-hidden
                        className={`absolute inset-y-2 right-0 rounded-l transition-colors ${
                          selected ? 'bg-signal-500/25' : 'bg-signal-500/12'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    )}
                    <span
                      className={`relative font-mono font-semibold tabular-nums ${
                        selected ? 'text-signal-400' : 'text-ink-100'
                      }`}
                    >
                      {formatProbability(point.p, 5)}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono tabular-nums text-ink-400">
                    {formatProbability(atLeast, 5)}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-ink-400">
                    {formatProbability(atMost, 5)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
