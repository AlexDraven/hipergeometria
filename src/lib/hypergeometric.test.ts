import { describe, expect, it } from 'vitest'
import {
  comboProbability,
  combination,
  distribution,
  drawCurve,
  expectedValue,
  hypergeometricCdfAtLeast,
  hypergeometricCdfAtMost,
  hypergeometricPmf,
  minimumCopies,
  validateParams,
} from './hypergeometric'

describe('combination', () => {
  it('calcula combinatorias pequeñas', () => {
    expect(combination(5, 2)).toBeCloseTo(10, 10)
    expect(combination(5, 0)).toBe(1)
    expect(combination(5, 5)).toBe(1)
    expect(combination(10, 3)).toBeCloseTo(120, 8)
  })

  it('maneja casos límite', () => {
    expect(combination(5, 6)).toBe(0)
    expect(combination(5, -1)).toBe(0)
  })

  it('maneja mazos grandes sin desbordar', () => {
    expect(combination(99, 7)).toBeGreaterThan(1e10)
    expect(Number.isFinite(combination(200, 100))).toBe(true)
  })
})

describe('hypergeometricPmf', () => {
  it('caso conocido: mazo de 40, 4 copias, robo 5', () => {
    // P(X=0) con N=40, K=4, n=5
    const p0 = hypergeometricPmf({ N: 40, K: 4, n: 5, k: 0 })
    expect(p0).toBeCloseTo((36 / 40) * (35 / 39) * (34 / 38) * (33 / 37) * (32 / 36), 10)
  })

  it('la suma sobre todos los k es 1', () => {
    const points = distribution(60, 8, 7)
    const total = points.reduce((acc, p) => acc + p.p, 0)
    expect(total).toBeCloseTo(1, 8)
  })

  it('devuelve 0 fuera del rango soportado', () => {
    expect(hypergeometricPmf({ N: 40, K: 4, n: 5, k: 10 })).toBe(0)
    expect(hypergeometricPmf({ N: 40, K: 4, n: 5, k: -1 })).toBe(0)
  })
})

describe('cdfs', () => {
  const N = 40
  const K = 4
  const n = 5

  it('P(X >= 1) = 1 - P(X = 0)', () => {
    const atLeast = hypergeometricCdfAtLeast({ N, K, n, k: 1 })
    const atMost = hypergeometricCdfAtMost({ N, K, n, k: 0 })
    expect(atLeast).toBeCloseTo(1 - atMost, 10)
  })

  it('P(X >= 0) = 1', () => {
    expect(hypergeometricCdfAtLeast({ N, K, n, k: 0 })).toBeCloseTo(1, 10)
  })

  it('P(X <= min(K,n)) = 1', () => {
    expect(hypergeometricCdfAtMost({ N, K, n, k: 4 })).toBeCloseTo(1, 10)
  })
})

describe('expectedValue', () => {
  it('E[X] = n * K / N', () => {
    expect(expectedValue({ N: 60, K: 8, n: 7 })).toBeCloseTo((7 * 8) / 60, 10)
  })
})

describe('distribution', () => {
  it('devuelve puntos entre from y to', () => {
    const points = distribution(40, 4, 5)
    expect(points[0].k).toBe(0)
    expect(points[points.length - 1].k).toBe(4)
    expect(points.length).toBe(5)
  })
})

describe('validateParams', () => {
  it('acepta parámetros válidos', () => {
    expect(validateParams({ N: 40, K: 4, n: 5, k: 1 })).toEqual([])
  })

  it('detecta k > n o k > K', () => {
    expect(validateParams({ N: 40, K: 4, n: 5, k: 6 })).not.toEqual([])
    expect(validateParams({ N: 40, K: 4, n: 5, k: 5 })).not.toEqual([])
  })

  it('detecta n > N', () => {
    expect(validateParams({ N: 40, K: 4, n: 41, k: 1 })).not.toEqual([])
  })
})

describe('drawCurve', () => {
  it('con perTurn = 1 roba 1 carta por turno', () => {
    const curve = drawCurve(10, 4, 1)
    expect(curve).toHaveLength(10)
    expect(curve[0].totalDrawn).toBe(1)
    expect(curve[9].totalDrawn).toBe(10)
  })

  it('el último punto es P(X ≥ 1) con todo el mazo robado = 1', () => {
    const curve = drawCurve(10, 3, 1)
    expect(curve[curve.length - 1].cumulative).toBeCloseTo(1, 10)
  })

  it('la probabilidad acumulada nunca decrece', () => {
    const curve = drawCurve(45, 4, 2)
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].cumulative).toBeGreaterThanOrEqual(curve[i - 1].cumulative - 1e-12)
    }
  })

  it('devuelve [] con parámetros inválidos', () => {
    expect(drawCurve(0, 4, 1)).toEqual([])
    expect(drawCurve(10, -1, 1)).toEqual([])
    expect(drawCurve(10, 4, 0)).toEqual([])
  })
})

describe('comboProbability', () => {
  it('con un solo grupo equivale a P(X ≥ 1)', () => {
    const combo = comboProbability(40, [4], 7)
    const single = hypergeometricCdfAtLeast({ N: 40, K: 4, n: 7, k: 1 })
    expect(combo).toBeCloseTo(single, 10)
  })

  it('caso enumerable por fuerza bruta', () => {
    // N=6, grupos A (2) y B (2), robo 4 de 6.
    // Subconjuntos de 4 cartas: 15 en total. Fallan los que evitan A
    // (1: las 2 de B + las 2 neutras) o evitan B (1). Válidos: 15 − 2 = 13.
    const p = comboProbability(6, [2, 2], 4)
    expect(p).toBeCloseTo(13 / 15, 10)
  })

  it('con n = N da 1', () => {
    expect(comboProbability(20, [3, 5], 20)).toBeCloseTo(1, 10)
  })

  it('con n = 0 da 0', () => {
    expect(comboProbability(20, [3, 5], 0)).toBe(0)
  })

  it('devuelve NaN con parámetros inválidos', () => {
    expect(comboProbability(0, [1], 1)).toBeNaN()
    expect(comboProbability(10, [], 1)).toBeNaN()
    expect(comboProbability(10, [5], 11)).toBeNaN()
  })
})

describe('minimumCopies', () => {
  it('copias mínimas crecen con el objetivo', () => {
    const low = minimumCopies(60, 7, 0.4)
    const high = minimumCopies(60, 7, 0.8)
    expect(high.copies).toBeGreaterThan(low.copies)
  })

  it('logra la probabilidad objetivo', () => {
    const target = 0.6
    const result = minimumCopies(45, 7, target)
    expect(result.probability).toBeGreaterThanOrEqual(target)
    expect(result.copies).toBeGreaterThanOrEqual(1)
  })

  it('con n = N alcanza el objetivo con 1 copia', () => {
    const result = minimumCopies(10, 10, 0.5)
    expect(result.copies).toBe(1)
    expect(result.probability).toBe(1)
  })
})
