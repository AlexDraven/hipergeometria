import { validateParams } from './hypergeometric'

export interface ShareableState {
  tab: 'general' | 'lairen'
  general: { N: number; K: number; n: number; k: number }
  lairen: { N: number; K: number }
}

function isInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value)
}

/** Valida la estructura del estado compartido. Devuelve null si es inválido. */
export function parseState(raw: unknown): ShareableState | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>

  const g = r.general as Record<string, unknown> | undefined
  if (typeof g !== 'object' || g === null) return null
  const { N, K, n, k } = g
  if (!isInt(N) || !isInt(K) || !isInt(n) || !isInt(k)) return null
  const general = { N, K, n, k }
  if (validateParams(general).length > 0) return null

  let lairen: ShareableState['lairen'] = { N: 45, K: 4 }
  const l = r.lairen as Record<string, unknown> | undefined
  if (typeof l === 'object' && l !== null && isInt(l.N) && isInt(l.K)) {
    if (l.N >= 1 && l.N <= 200 && l.K >= 0 && l.K <= l.N) {
      lairen = { N: l.N, K: l.K }
    }
  }

  return { tab: r.tab === 'lairen' ? 'lairen' : 'general', general, lairen }
}

/** Codifica el estado en una cadena compacta segura para la URL. */
export function encodeState(state: ShareableState): string {
  const json = JSON.stringify(state)
  return btoa(encodeURIComponent(json)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

/** Decodifica la cadena de la URL. Devuelve null si no es válida. */
export function decodeState(encoded: string): ShareableState | null {
  try {
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const json = decodeURIComponent(atob(padded))
    return parseState(JSON.parse(json))
  } catch {
    return null
  }
}

export const HASH_PREFIX = '#lairen='

/** Lee el estado desde el hash de la URL actual. */
export function readHashState(): ShareableState | null {
  const hash = window.location.hash
  if (!hash.startsWith(HASH_PREFIX)) return null
  return decodeState(hash.slice(HASH_PREFIX.length))
}

/** Escribe el estado en el hash de la URL sin recargar la página. */
export function writeHashState(state: ShareableState): void {
  window.history.replaceState(null, '', HASH_PREFIX + encodeState(state))
}
