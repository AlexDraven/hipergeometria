import { expectedValue, hypergeometricCdfAtLeast } from '../lib/hypergeometric'
import { formatProbability, oneInEvery } from '../lib/format'

interface ResultCardProps {
  atLeast: number
  atMost: number
  k: number
  N: number
  K: number
  n: number
  hasErrors: boolean
}

export default function ResultCard({
  atLeast,
  atMost,
  k,
  N,
  K,
  n,
  hasErrors,
}: ResultCardProps) {
  const exp = expectedValue({ N, K, n })
  const atLeastOne = hypergeometricCdfAtLeast({ N, K, n, k: 1 })
  const odds = oneInEvery(atLeastOne)

  return (
    <div className="paper-slip p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
          Robar al menos una copia
        </p>
        <span className="shrink-0 rounded border border-signal-500/50 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-signal-600">
          {k} de {K} copias
        </span>
      </div>

      <p className="mt-5 font-display text-6xl font-semibold leading-none tracking-tight sm:text-7xl">
        {hasErrors ? '—' : formatProbability(atLeastOne, 5)}
      </p>

      {odds && !hasErrors ? (
        <p className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-2xl font-semibold text-signal-600 sm:text-3xl">
            {odds}
          </span>
          <span className="text-sm text-paper-ink/70">mazos como el tuyo</span>
        </p>
      ) : K === 0 ? (
        <p className="mt-5 text-sm text-paper-ink/60">
          No hay copias de esa carta en el mazo.
        </p>
      ) : (
        <p className="mt-5 text-sm text-paper-ink/60">
          Ajusta los parámetros para calcular.
        </p>
      )}

      <div className="mt-6 grid grid-cols-3 gap-2.5">
        <Stat label="P(X ≥ k)" value={hasErrors ? '—' : formatProbability(atLeast, 5)} highlight />
        <Stat label="P(X ≤ k)" value={hasErrors ? '—' : formatProbability(atMost, 5)} />
        <Stat label="E[X]" value={hasErrors ? '—' : exp.toFixed(2)} />
      </div>

      <div className="relative -mx-6 mt-6 border-t border-dashed border-paper-ink/30 px-6 pt-4">
        <span
          aria-hidden
          className="absolute left-0 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-felt-950"
        />
        <span
          aria-hidden
          className="absolute right-0 top-0 h-3 w-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-felt-950"
        />
        <p className="text-xs leading-relaxed text-paper-ink/70">
          Robas <strong className="font-semibold text-paper-ink">{n}</strong> de{' '}
          <strong className="font-semibold text-paper-ink">{N}</strong> cartas sin
          reemplazo, buscando <strong className="font-semibold text-paper-ink">{K}</strong>{' '}
          copias.
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
      className={`rounded border px-2 py-3 ${
        highlight
          ? 'border-signal-500/50 bg-signal-500/10'
          : 'border-paper-ink/15'
      }`}
    >
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-paper-ink/60">
        {label}
      </p>
      <p
        className={`mt-1 font-mono text-base font-semibold tabular-nums ${
          highlight ? 'text-signal-600' : 'text-paper-ink'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
