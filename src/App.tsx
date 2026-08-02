import { useMemo, useState } from 'react'
import type { HypergeometricParams } from './lib/hypergeometric'
import {
  distribution,
  hypergeometricCdfAtLeast,
  hypergeometricCdfAtMost,
  hypergeometricPmf,
  validateParams,
} from './lib/hypergeometric'
import Calculator from './components/Calculator'
import ResultCard from './components/ResultCard'
import DistributionChart from './components/DistributionChart'
import ProbabilityTable from './components/ProbabilityTable'

function App() {
  const [params, setParams] = useState<HypergeometricParams>({
    N: 60,
    K: 4,
    n: 7,
    k: 1,
  })

  const { N, K, n, k } = params

  const errors = useMemo(() => validateParams(params), [params])
  const hasErrors = errors.length > 0

  const pmf = useMemo(() => hypergeometricPmf(params), [params])
  const atLeast = useMemo(() => hypergeometricCdfAtLeast(params), [params])
  const atMost = useMemo(() => hypergeometricCdfAtMost(params), [params])
  const points = useMemo(() => distribution(N, K, n), [N, K, n])

  const selectK = (value: number) => {
    setParams((prev) => ({ ...prev, k: value }))
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col px-4 py-10 sm:px-6">
      <header className="mb-10">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-arcana-400/30 bg-arcana-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-arcana-300">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-300 shadow shadow-gold-300/50" />
          Herramienta para TCG
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-gradient">Calculadora</span>{' '}
          <span className="text-white">Hipergeométrica</span>
        </h1>
        <p className="mt-3 max-w-2xl text-mist-400">
          Saber la probabilidad de robar tus cartas clave es la base de todo mazo
          competitivo. Modela tu robo sin reemplazo con la distribución
          hipergeométrica.
        </p>
      </header>

      <main className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Calculator params={params} errors={errors} onChange={setParams} />

        <div className="lg:sticky lg:top-6 lg:self-start">
          <ResultCard
            pmf={pmf}
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
          <p className="text-xs text-mist-400">
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

      <footer className="mt-10 pb-4 text-center text-xs text-mist-500">
        Modelo hipergeométrico · sin backend, todo se calcula en tu navegador.
      </footer>
    </div>
  )
}

export default App
