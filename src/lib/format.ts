/** Formatea una probabilidad (0..1) como porcentaje con precisión adaptativa. */
export function formatProbability(p: number, digits = 4): string {
  if (!Number.isFinite(p) || p < 0) return '—'
  if (p === 0) return '0%'
  if (p >= 1) return '100%'
  const percent = p * 100
  if (percent >= 10) return `${percent.toFixed(2)}%`
  if (percent >= 1) return `${percent.toFixed(3)}%`
  if (percent >= 0.1) return `${percent.toFixed(4)}%`
  return `${percent.toFixed(Math.max(digits, 4))}%`
}

/** Devuelve "1 de cada X" para una probabilidad, o null si no aplica. */
export function oneInEvery(p: number): string | null {
  if (!Number.isFinite(p) || p <= 0 || p >= 1) return null
  const n = Math.round(1 / p)
  if (n < 2) return null
  return `1 de cada ${n}`
}
