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
