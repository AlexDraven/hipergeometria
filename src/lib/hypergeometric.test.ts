import { describe, expect, it } from 'vitest'
import {
  combination,
  distribution,
  expectedValue,
  hypergeometricCdfAtLeast,
  hypergeometricCdfAtMost,
  hypergeometricPmf,
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
