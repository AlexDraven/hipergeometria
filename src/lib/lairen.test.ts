import { describe, expect, it } from 'vitest'
import {
  DEFAULT_HAND_SIZES,
  lairenFailProbability,
  lairenMulliganCurve,
} from './lairen'
import { combination } from './hypergeometric'

describe('lairenFailProbability', () => {
  it('F = C(N−K, n) / C(N, n)', () => {
    const f = lairenFailProbability(46, 4, 6)
    expect(f).toBeCloseTo(combination(42, 6) / combination(46, 6), 10)
  })

  it('sin copias F = 1, con todo el mazo F = 0', () => {
    expect(lairenFailProbability(46, 0, 6)).toBeCloseTo(1, 10)
    expect(lairenFailProbability(46, 46, 6)).toBeCloseTo(0, 10)
  })

  it('devuelve NaN con parámetros inválidos', () => {
    expect(lairenFailProbability(0, 1, 6)).toBeNaN()
    expect(lairenFailProbability(46, 50, 6)).toBeNaN()
    expect(lairenFailProbability(46, 4, -1)).toBeNaN()
  })
})

describe('lairenMulliganCurve', () => {
  it('con 0 copias la curva es siempre 0', () => {
    const curve = lairenMulliganCurve(46, 0, DEFAULT_HAND_SIZES)
    expect(curve.map((p) => p.cumulative)).toEqual([0, 0, 0, 0, 0, 0])
  })

  it('con todas las cartas iguales la curva es siempre 1', () => {
    const curve = lairenMulliganCurve(46, 46, DEFAULT_HAND_SIZES)
    expect(curve.map((p) => p.cumulative)).toEqual([1, 1, 1, 1, 1, 1])
  })

  it('usa el calendario de Lairen por defecto (6, 6, 5, 4, 3, 2)', () => {
    const curve = lairenMulliganCurve(46, 4)
    expect(curve.map((p) => p.handSize)).toEqual([6, 6, 5, 4, 3, 2])
  })

  it('P(m) = 1 − ∏ F_i con el calendario de Lairen', () => {
    const N = 46
    const K = 4
    const fails = DEFAULT_HAND_SIZES.map((n) => lairenFailProbability(N, K, n))
    const curve = lairenMulliganCurve(N, K)
    let product = 1
    for (let m = 0; m < curve.length; m++) {
      product *= fails[m]
      expect(curve[m].cumulative).toBeCloseTo(1 - product, 10)
    }
  })

  it('un draft de 7 repetido equivale a 1 − F^(m+1)', () => {
    const N = 46
    const K = 4
    const f = combination(N - K, 7) / combination(N, 7)
    const curve = lairenMulliganCurve(N, K, [7, 7, 7, 7, 7, 7])
    for (let m = 0; m < curve.length; m++) {
      expect(curve[m].handSize).toBe(7)
      expect(curve[m].cumulative).toBeCloseTo(1 - Math.pow(f, m + 1), 10)
    }
  })

  it('respeta un calendario personalizado', () => {
    const curve = lairenMulliganCurve(40, 4, [3, 4])
    expect(curve.map((p) => p.handSize)).toEqual([3, 4])
    expect(curve.length).toBe(2)
  })

  it('la curva es monótona creciente', () => {
    const curve = lairenMulliganCurve(46, 4, DEFAULT_HAND_SIZES)
    for (let m = 1; m < curve.length; m++) {
      expect(curve[m].cumulative).toBeGreaterThanOrEqual(curve[m - 1].cumulative)
    }
  })
})
