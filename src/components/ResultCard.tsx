import { expectedValue } from '../lib/hypergeometric'
import { formatProbability, oneInEvery } from '../lib/format'

interface ResultCardProps {
  pmf: number
  atLeast: number
  atMost: number
  k: number
  N: number
  K: number
  n: number
  hasErrors: boolean
}

export default function ResultCard({
  pmf,
  atLeast,
  atMost,
  k,
  N,
  K,
  n,
  hasErrors,
}: ResultCardProps) {
  const exp = expectedValue({ N, K, n })
  const odds = oneInEvery(pmf)

  return (
    <div className="card-frame card-shimmer">
      <div className="rounded-[1.15rem] bg-gradient-to-b from-abyss-800 to-abyss-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="panel-title">Probabilidad exacta</h2>
          <span className="rounded-full border border-gold-300/40 bg-gold-300/10 px-3 py-1 text-xs font-semibold text-gold-300">
            {k} de {K} copias
          </span>
        </div>

        <p className="text-gradient font-display text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          {hasErrors ? '—' : formatProbability(pmf, 5)}
        </p>

        {odds && !hasErrors && (
          <p className="mt-1 text-sm text-mist-400">
            Es decir, <span className="font-semibold text-mist-200">{odds}</span> mazos
            como el tuyo
          </p>
        )}

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Stat label="P(X ≥ k)" value={hasErrors ? '—' : formatProbability(atLeast, 5)} highlight />
          <Stat label="P(X ≤ k)" value={hasErrors ? '—' : formatProbability(atMost, 5)} />
          <Stat label="Esperado" value={hasErrors ? '—' : exp.toFixed(2)} />
        </div>

        <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-relaxed text-mist-400">
          Modelo hipergeométrico: robas <strong className="text-mist-200">{n}</strong> de{' '}
          <strong className="text-mist-200">{N}</strong> cartas sin reemplazo, buscando{' '}
          <strong className="text-mist-200">{K}</strong> copias.
        </p>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-xl border px-2 py-3 ${
        highlight
          ? 'border-arcana-400/50 bg-arcana-500/15'
          : 'border-white/10 bg-white/5'
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-mist-400">
        {label}
      </p>
      <p
        className={`mt-1 text-lg font-bold tabular-nums ${
          highlight ? 'text-white' : 'text-mist-200'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
