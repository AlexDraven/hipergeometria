import { useEffect, useState } from 'react'
import type { HypergeometricParams, ValidationError } from '../lib/hypergeometric'

interface Preset {
  label: string
  N: number
  K: number
  detail: string
}

const PRESETS: Preset[] = [
  { label: 'Magic', N: 60, K: 4, detail: 'Mazo estándar' },
  { label: 'Commander', N: 99, K: 3, detail: 'Mazo de 99' },
  { label: 'Yu-Gi-Oh!', N: 40, K: 3, detail: 'Mazo principal' },
  { label: 'Pokémon', N: 60, K: 4, detail: 'Mazo de 60' },
]

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.round(value)))
}

interface FieldProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  hint: string
  error?: string
  accent: string
  onChange: (v: number) => void
}

function Field({ id, label, value, min, max, hint, error, accent, onChange }: FieldProps) {
  const [text, setText] = useState(String(value))

  useEffect(() => {
    setText(String(value))
  }, [value])

  const commit = (raw: string) => {
    setText(raw)
    const parsed = Number.parseInt(raw, 10)
    if (Number.isInteger(parsed)) onChange(parsed)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-mist-200">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={text}
            onChange={(e) => commit(e.target.value)}
            className="w-20 rounded-lg border border-white/10 bg-abyss-800/70 px-2 py-1 text-right font-semibold text-white outline-none transition focus:border-arcana-400/60 focus:ring-2 focus:ring-arcana-500/30"
            aria-invalid={error ? true : undefined}
          />
          <span
            className={`rounded-full bg-gradient-to-br px-2.5 py-1 text-xs font-bold tabular-nums ${accent}`}
          >
            {value}
          </span>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="aria-invalid:ring-2 aria-invalid:ring-ember-500/50"
      />

      <p className="text-xs text-mist-400">{hint}</p>
      {error && <p className="text-xs font-medium text-ember-400">{error}</p>}
    </div>
  )
}

interface CalculatorProps {
  params: HypergeometricParams
  errors: ValidationError[]
  onChange: (params: HypergeometricParams) => void
}

export default function Calculator({ params, errors, onChange }: CalculatorProps) {
  const { N, K, n, k } = params

  const setField = (field: keyof HypergeometricParams, value: number) => {
    let next: HypergeometricParams = { ...params, [field]: value }
    next.K = clampInt(next.K, 0, next.N)
    next.n = clampInt(next.n, 0, next.N)
    next.k = clampInt(next.k, 0, Math.min(next.K, next.n))
    onChange(next)
  }

  const applyPreset = (preset: Preset) => {
    onChange({
      N: preset.N,
      K: clampInt(preset.K, 0, preset.N),
      n: clampInt(n, 0, preset.N),
      k: clampInt(k, 0, Math.min(preset.K, n)),
    })
  }

  const errorFor = (field: string) =>
    errors.find((e) => e.field === field)?.message

  return (
    <section className="panel p-6" aria-label="Parámetros del cálculo">
      <h2 className="panel-title mb-4">Mazo</h2>

      <div className="mb-6 flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const active = preset.N === N && preset.K === K
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`group rounded-xl border px-3 py-2 text-left transition ${
                active
                  ? 'border-arcana-400/60 bg-arcana-500/20 shadow-lg shadow-arcana-600/20'
                  : 'border-white/10 bg-white/5 hover:border-arcana-400/40 hover:bg-white/10'
              }`}
            >
              <span className="block text-sm font-semibold text-white">
                {preset.label}
              </span>
              <span className="block text-xs text-mist-400">{preset.detail}</span>
            </button>
          )
        })}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id="field-N"
          label="Cartas en el mazo"
          value={N}
          min={1}
          max={200}
          hint="Tamaño total del mazo (N)"
          error={errorFor('N')}
          accent="from-cyan-400 to-blue-500 text-white"
          onChange={(v) => setField('N', v)}
        />
        <Field
          id="field-K"
          label="Copias de la carta"
          value={K}
          min={0}
          max={N}
          hint="Ejemplares que te interesan (K)"
          error={errorFor('K')}
          accent="from-arcana-400 to-fuchsia-500 text-white"
          onChange={(v) => setField('K', v)}
        />
        <Field
          id="field-n"
          label="Cartas robadas"
          value={n}
          min={0}
          max={N}
          hint="Mano inicial o total robado (n)"
          error={errorFor('n')}
          accent="from-ember-400 to-rose-600 text-white"
          onChange={(v) => setField('n', v)}
        />
        <Field
          id="field-k"
          label="Copias que quieres"
          value={k}
          min={0}
          max={Math.min(K, n)}
          hint="Objetivo de copias en tu mano (k)"
          error={errorFor('k')}
          accent="from-gold-300 to-amber-500 text-abyss-900"
          onChange={(v) => setField('k', v)}
        />
      </div>
    </section>
  )
}
