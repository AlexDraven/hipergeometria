import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

const STORAGE_PREFIX = 'hipergeometria:'

export function loadValue<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveValue(key: string, value: unknown): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
}

/** Estado React que se persiste en localStorage entre sesiones. */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => loadValue(key, initial))
  useEffect(() => {
    saveValue(key, value)
  }, [key, value])
  return [value, setValue]
}
