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
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-mist-400">
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
                className={`border-b border-white/5 transition ${
                  selected
                    ? 'bg-gold-300/10 text-white'
                    : 'text-mist-200 hover:bg-white/5'
                }`}
              >
                <td className="py-2.5 pr-4">
                  <span
                    className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-bold ${
                      selected ? 'bg-gold-300 text-abyss-900' : 'bg-abyss-700 text-mist-200'
                    }`}
                  >
                    {point.k}
                  </span>
                </td>
                <td
                  className={`py-2.5 pr-4 text-right font-semibold tabular-nums ${
                    selected ? 'text-gold-300' : 'text-white'
                  }`}
                >
                  {formatProbability(point.p, 5)}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums">
                  {formatProbability(atLeast, 5)}
                </td>
                <td className="py-2.5 text-right tabular-nums">
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
