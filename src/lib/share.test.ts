import { describe, expect, it } from 'vitest'
import {
  decodeState,
  encodeState,
  parseState,
} from './share'
import type { ShareableState } from './share'

describe('share', () => {
  const state: ShareableState = {
    tab: 'general',
    general: { N: 60, K: 4, n: 7, k: 1 },
    lairen: { N: 45, K: 4 },
  }

  it('round-trip de encode → decode', () => {
    const encoded = encodeState(state)
    expect(decodeState(encoded)).toEqual(state)
  })

  it('la cadena codificada usa solo caracteres seguros para URL', () => {
    const encoded = encodeState(state)
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(encoded).not.toContain('+')
    expect(encoded).not.toContain('/')
    expect(encoded).not.toContain('=')
  })

  it('no incluye el prefijo del hash', () => {
    expect(encodeState(state)).not.toContain('#lairen=')
  })

  it('parseState rechaza estructuras inválidas', () => {
    expect(parseState(null)).toBeNull()
    expect(parseState({})).toBeNull()
    expect(parseState({ general: { N: 0, K: 4, n: 7, k: 1 } })).toBeNull()
    expect(parseState({ general: { N: 60, K: 4, n: 7, k: 1 } })).not.toBeNull()
  })

  it('rechaza texto corrupto', () => {
    expect(decodeState('no-es-base64!!')).toBeNull()
    expect(decodeState('')).toBeNull()
  })

  it('reemplaza el tab lairen cuando llega por la URL', () => {
    const withLairen: ShareableState = {
      ...state,
      tab: 'lairen',
      lairen: { N: 30, K: 2 },
    }
    const decoded = decodeState(encodeState(withLairen))
    expect(decoded?.tab).toBe('lairen')
    expect(decoded?.lairen).toEqual({ N: 30, K: 2 })
  })
})
