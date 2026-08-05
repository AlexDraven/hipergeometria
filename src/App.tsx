import { useEffect, useMemo, useState } from 'react'
import type { HypergeometricParams } from './lib/hypergeometric'
import {
  distribution,
  hypergeometricCdfAtLeast,
  hypergeometricCdfAtMost,
  validateParams,
} from './lib/hypergeometric'
import { usePersistentState } from './lib/persist'
import { encodeState, HASH_PREFIX, readHashState } from './lib/share'
import type { ShareableState } from './lib/share'
import Calculator from './components/Calculator'
import ResultCard from './components/ResultCard'
import DistributionChart from './components/DistributionChart'
import ProbabilityTable from './components/ProbabilityTable'
import LairenTCG from './components/LairenTCG'
import Tools from './components/Tools'

type GameMode = 'general' | 'lairen'

const GAME_TABS: { value: GameMode; label: string }[] = [
  { value: 'general', label: 'Hipergeométrica' },
  { value: 'lairen', label: 'LairenTCG' },
]

const DEFAULT_STATE: ShareableState = {
  tab: 'general',
  general: { N: 60, K: 4, n: 7, k: 1 },
  lairen: { N: 45, K: 4 },
}

function initialShareable(): ShareableState {
  return readHashState() ?? DEFAULT_STATE
}

function App() {
  const [initial] = useState(initialShareable)
  const [game, setGame] = usePersistentState<GameMode>('tab', initial.tab)
  const [params, setParams] = usePersistentState<HypergeometricParams>(
    'params',
    initial.general,
  )
  const [lairen, setLairen] = usePersistentState<{ N: number; K: number }>(
    'lairen',
    initial.lairen,
  )
  const [copied, setCopied] = useState(false)

  const { N, K, n, k } = params

  useEffect(() => {
    window.history.replaceState(
      null,
      '',
      HASH_PREFIX + encodeState({ tab: game, general: params, lairen }),
    )
  }, [game, params, lairen])

  const copyLink = async () => {
    const url =
      window.location.origin +
      window.location.pathname +
      HASH_PREFIX +
      encodeState({ tab: game, general: params, lairen })
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* portapapeles no disponible: se ignora */
    }
  }

  const errors = useMemo(() => validateParams(params), [params])
  const hasErrors = errors.length > 0

  const atLeast = useMemo(() => hypergeometricCdfAtLeast(params), [params])
  const atMost = useMemo(() => hypergeometricCdfAtMost(params), [params])
  const points = useMemo(() => distribution(N, K, n), [N, K, n])

  const selectK = (value: number) => {
    setParams((prev) => ({ ...prev, k: value }))
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col px-4 py-10 sm:px-6">
      <header className="mb-10 border-b border-felt-700 pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-4 flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-ink-400">
              <span className="h-px w-8 bg-signal-500" />
              Herramienta para TCG
            </p>
            <h1 className="font-display text-4xl font-semibold leading-none tracking-tight text-ink-100 sm:text-6xl">
              Calculadora <span className="italic">Hipergeométrica</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-400 sm:text-base">
              Saber la probabilidad de robar tus cartas clave es la base de todo
              mazo competitivo. Modela tu robo sin reemplazo con la distribución
              hipergeométrica.
            </p>
          </div>
        </div>
      </header>

      <nav className="mb-8 flex flex-wrap items-center justify-center gap-3" aria-label="Juego">
        <div className="flex rounded-lg border border-felt-700 bg-felt-900/70 p-1">
          {GAME_TABS.map((tab) => {
            const active = game === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setGame(tab.value)}
                aria-pressed={active}
                className={`rounded-md px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition ${
                  active
                    ? 'bg-paper text-paper-ink shadow-sm'
                    : 'text-ink-400 hover:text-ink-200'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={copyLink}
          className="flex items-center gap-1.5 rounded-lg border border-felt-600 bg-felt-900/70 px-3 py-1.5 font-mono text-xs font-semibold text-ink-300 transition hover:border-felt-500 hover:text-ink-100"
        >
          {copied ? '¡Copiado!' : 'Copiar enlace'}
        </button>
      </nav>

      {game === 'lairen' ? (
        <LairenTCG
          N={lairen.N}
          K={lairen.K}
          onChange={(next) => setLairen((prev) => ({ ...prev, ...next }))}
        />
      ) : (
        <>
          <main className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Calculator params={params} errors={errors} onChange={setParams} />

        <div className="lg:sticky lg:top-6 lg:self-start">
          <ResultCard
            atLeast={atLeast}
            atMost={atMost}
            k={k}
            N={N}
            K={K}
            n={n}
            hasErrors={hasErrors}
          />
        </div>
      </main>

      <section className="panel mt-6 p-6" aria-label="Distribución completa">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="panel-title">Distribución completa</h2>
          <p className="font-mono text-xs text-ink-500">
            Toca una barra para fijar el objetivo (k)
          </p>
        </div>
        <DistributionChart points={points} selectedK={k} onSelect={selectK} />
      </section>

      <section className="panel mt-6 p-6" aria-label="Tabla de probabilidades">
        <div className="mb-4">
          <h2 className="panel-title">Tabla de probabilidades</h2>
        </div>
        <ProbabilityTable points={points} selectedK={k} N={N} K={K} n={n} />
      </section>

      <Tools N={N} K={K} n={n} />
        </>
      )}
    </div>
  )
}

export default App
