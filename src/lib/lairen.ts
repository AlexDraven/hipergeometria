import { combination, hypergeometricCdfAtLeast } from './hypergeometric'

/** Mano efectiva por intento en Lairen: se roban 7 y se botan i cartas. */
export const DEFAULT_HAND_SIZES = [6, 6, 5, 4, 3, 2]

/** Probabilidad de NO encontrar la carta en un intento: F = C(N−K, n) / C(N, n). */
export function lairenFailProbability(N: number, K: number, n: number): number {
  if (!Number.isInteger(N) || !Number.isInteger(K) || N <= 0 || K < 0 || K > N) return NaN
  if (!Number.isInteger(n) || n < 0) return NaN
  const fail = combination(N - K, n) / combination(N, n)
  if (!Number.isFinite(fail)) return NaN
  return Math.min(1, Math.max(0, fail))
}

export interface LairenMulliganPoint {
  /** Mulligans acumulados (se hicieron los intentos 0…m). */
  m: number
  /** Mano efectiva del último intento. */
  handSize: number
  /** P de tener al menos 1 copia tras m mulligans: 1 − ∏ F_i. */
  cumulative: number
}

/**
 * Curva acumulada del mulligan: P(m) = 1 − ∏ F(N, K, n_i) para i = 0…m.
 * Cada intento re-baraja el mazo completo, así que los intentos son independientes.
 */
export function lairenMulliganCurve(
  N: number,
  K: number,
  handSizes: number[] = DEFAULT_HAND_SIZES,
): LairenMulliganPoint[] {
  const points: LairenMulliganPoint[] = []
  let failProduct = 1
  for (let m = 0; m < handSizes.length; m++) {
    const handSize = handSizes[m]
    const fail = lairenFailProbability(N, K, handSize)
    if (Number.isNaN(fail)) {
      return [{ m, handSize, cumulative: NaN }]
    }
    failProduct *= fail
    points.push({ m, handSize, cumulative: 1 - failProduct })
  }
  return points
}

/** P de ver al menos 1 copia en un solo draft de `n` cartas (antes de botar). */
export function lairenDraftSingle(N: number, K: number, n = 7): number {
  return hypergeometricCdfAtLeast({ N, K, n, k: 1 })
}
