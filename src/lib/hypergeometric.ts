export interface HypergeometricParams {
  /** Tamaño del mazo (población). */
  N: number
  /** Copias de la carta en el mazo (éxitos en la población). */
  K: number
  /** Cartas robadas (tamaño de la muestra). */
  n: number
  /** Copias objetivo robadas (éxitos en la muestra). */
  k: number
}

export interface DistributionPoint {
  k: number
  p: number
}

/** Factorial exacto para enteros pequeños (referencia / tests). */
export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

/**
 * Logaritmo natural de C(n, k), calculado por suma de logaritmos
 * para evitar desbordes con mazos grandes.
 */
export function logCombination(n: number, k: number): number {
  if (k < 0 || k > n) return -Infinity
  k = Math.min(k, n - k)
  let s = 0
  for (let i = 0; i < k; i++) {
    s += Math.log(n - i) - Math.log(i + 1)
  }
  return s
}

/** Combinatoria C(n, k). */
export function combination(n: number, k: number): number {
  return Math.exp(logCombination(n, k))
}

/**
 * Probabilidad puntual P(X = k) de la distribución hipergeométrica:
 * P(X=k) = C(K,k) · C(N−K, n−k) / C(N,n)
 */
export function hypergeometricPmf(params: HypergeometricParams): number {
  const { N, K, n, k } = params
  if (k < 0 || k > K || k > n) return 0
  if (n - k > N - K) return 0
  if (N <= 0 || K < 0 || K > N || n < 0 || n > N) return NaN

  const logP =
    logCombination(K, k) + logCombination(N - K, n - k) - logCombination(N, n)
  return Math.exp(logP)
}

/** Probabilidad acumulada P(X ≤ k). */
export function hypergeometricCdfAtMost(params: HypergeometricParams): number {
  const { N, K, n, k } = params
  let sum = 0
  const from = Math.max(0, n - (N - K))
  const to = Math.min(k, K, n)
  if (to < from) return 0
  for (let i = from; i <= to; i++) {
    sum += hypergeometricPmf({ N, K, n, k: i })
  }
  return sum
}

/** Probabilidad acumulada P(X ≥ k). */
export function hypergeometricCdfAtLeast(params: HypergeometricParams): number {
  const { N, K, n, k } = params
  let sum = 0
  const from = Math.max(k, 0, n - (N - K))
  const to = Math.min(K, n)
  if (from > to) return 0
  for (let i = from; i <= to; i++) {
    sum += hypergeometricPmf({ N, K, n, k: i })
  }
  return sum
}

/** Valor esperado E[X] = n·K/N. */
export function expectedValue(params: Pick<HypergeometricParams, 'N' | 'K' | 'n'>): number {
  const { N, K, n } = params
  if (N <= 0) return NaN
  return (n * K) / N
}

/** P(X ≥ 1): probabilidad de robar al menos una copia. */
function pAtLeastOne(N: number, K: number, n: number): number {
  return hypergeometricCdfAtLeast({ N, K, n, k: 1 })
}

export interface DrawCurvePoint {
  /** Turno de la partida. */
  t: number
  /** Cartas acumuladas robadas hasta el turno t. */
  totalDrawn: number
  /** P de tener al menos 1 copia robada hasta el turno t. */
  cumulative: number
}

/**
 * Curva por turnos: robando `perTurn` cartas cada turno, ¿cuál es la
 * probabilidad acumulada de tener al menos 1 copia en el turno t?
 */
export function drawCurve(N: number, K: number, perTurn: number): DrawCurvePoint[] {
  if (!Number.isInteger(N) || N <= 0) return []
  if (!Number.isInteger(K) || K < 0 || K > N) return []
  if (!Number.isInteger(perTurn) || perTurn <= 0) return []
  const points: DrawCurvePoint[] = []
  for (let t = 1; t <= Math.ceil(N / perTurn); t++) {
    const totalDrawn = Math.min(perTurn * t, N)
    points.push({ t, totalDrawn, cumulative: pAtLeastOne(N, K, totalDrawn) })
  }
  return points
}

/**
 * Probabilidad de robar al menos 1 copia de cada grupo de cartas distintas
 * al robar n cartas. Se calcula por inclusión–exclusión sobre los grupos:
 * P(∩ E_g) = 1 − Σ_{∅≠S⊆G} (−1)^(|S|+1) · C(N − Σ_{g∈S} K_g, n) / C(N, n)
 */
export function comboProbability(N: number, ks: number[], n: number): number {
  if (!Number.isInteger(N) || N <= 0) return NaN
  if (!Array.isArray(ks) || ks.length === 0) return NaN
  for (const k of ks) {
    if (!Number.isInteger(k) || k < 0 || k > N) return NaN
  }
  if (!Number.isInteger(n) || n < 0 || n > N) return NaN

  const denom = combination(N, n)
  if (!Number.isFinite(denom) || denom <= 0) return NaN

  const total = 1 << ks.length
  let union = 0
  for (let mask = 1; mask < total; mask++) {
    let removed = 0
    let size = 0
    for (let g = 0; g < ks.length; g++) {
      if (mask & (1 << g)) {
        removed += ks[g]
        size++
      }
    }
    const term = combination(N - removed, n) / denom
    union += size % 2 === 1 ? term : -term
  }
  return Math.min(1, Math.max(0, 1 - union))
}

export interface MinimumCopiesResult {
  /** Menor cantidad de copias que alcanza la probabilidad objetivo. */
  copies: number
  /** Probabilidad real que se logra con esa cantidad de copias. */
  probability: number
}

/**
 * Dado N y n, devuelve el menor K tal que P(X ≥ 1) ≥ target.
 * La probabilidad crece con K, así que basta con recorrer de 0 a N.
 */
export function minimumCopies(N: number, n: number, target: number): MinimumCopiesResult {
  if (!Number.isInteger(N) || N <= 0) return { copies: 0, probability: 0 }
  if (!Number.isInteger(n) || n < 0 || n > N) return { copies: 0, probability: 0 }
  if (!Number.isFinite(target)) return { copies: 0, probability: 0 }
  const t = Math.min(1, Math.max(0, target))
  if (t <= 0) return { copies: 0, probability: 0 }
  for (let K = 0; K <= N; K++) {
    const p = pAtLeastOne(N, K, n)
    if (p >= t) return { copies: K, probability: p }
  }
  return { copies: N, probability: 1 }
}

/** Rango de valores de k con probabilidad no nula. */
export function distributionRange(N: number, K: number, n: number): {
  from: number
  to: number
} {
  return {
    from: Math.max(0, n - (N - K)),
    to: Math.min(K, n),
  }
}

/** Punto de la distribución para cada k posible. */
export function distribution(N: number, K: number, n: number): DistributionPoint[] {
  const { from, to } = distributionRange(N, K, n)
  const points: DistributionPoint[] = []
  for (let k = from; k <= to; k++) {
    points.push({ k, p: hypergeometricPmf({ N, K, n, k }) })
  }
  return points
}

export interface ValidationError {
  field: 'N' | 'K' | 'n' | 'k'
  message: string
}

/**
 * Valida los parámetros para la UI. Devuelve una lista de errores
 * o una lista vacía si todo es válido.
 */
export function validateParams(params: HypergeometricParams): ValidationError[] {
  const { N, K, n, k } = params
  const errors: ValidationError[] = []

  if (!Number.isInteger(N) || N < 1) {
    errors.push({ field: 'N', message: 'El tamaño del mazo debe ser un entero positivo.' })
  }
  if (!Number.isInteger(K) || K < 0 || (Number.isInteger(N) && K > N)) {
    errors.push({ field: 'K', message: 'Las copias deben estar entre 0 y el tamaño del mazo.' })
  }
  if (!Number.isInteger(n) || n < 0 || (Number.isInteger(N) && n > N)) {
    errors.push({ field: 'n', message: 'Las cartas robadas deben estar entre 0 y el tamaño del mazo.' })
  }
  if (!Number.isInteger(k) || k < 0 || (Number.isInteger(n) && k > n) || (Number.isInteger(K) && k > K)) {
    errors.push({ field: 'k', message: 'El objetivo debe estar entre 0 y las copias o cartas robadas.' })
  }

  return errors
}
