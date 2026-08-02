import {
  hypergeometricCdfAtLeast,
  hypergeometricCdfAtMost,
  type DistributionPoint,
} from '../lib/hypergeometric'
import { formatProbability } from '../lib/format'

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
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-felt-600 text-left font-mono text-[11px] uppercase tracking-wider text-ink-500">
            <th className="py-3 pr-4 font-semibold">k</th>
            <th className="py-3 pr-4 text-right font-semibold">P(X = k)</th>
            <th className="py-3 pr-4 text-right font-semibold">P(X ≥ k)</th>
            <th className="py-3 text-right font-semibold">P(X ≤ k)</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => {
            const selected = point.k === selectedK
            const atLeast = hypergeometricCdfAtLeast({ N, K, n, k: point.k })
            const atMost = hypergeometricCdfAtMost({ N, K, n, k: point.k })
            return (
              <tr
                key={point.k}
                className={`border-b border-felt-700/70 transition ${
                  selected
                    ? 'bg-signal-500/10 text-ink-100'
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
                <td
                  className={`py-2.5 pr-4 text-right font-mono font-semibold tabular-nums ${
                    selected ? 'text-signal-400' : 'text-ink-100'
                  }`}
                >
                  {formatProbability(point.p, 5)}
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
  )
}
