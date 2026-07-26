import { useState, useCallback } from 'react'

const STORAGE_KEY = 'conciliacion_context'

function readStoredContext() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredContext(context) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context))
  } catch {
    // Si localStorage no está disponible, simplemente no persistimos.
  }
}

// Contexto de "qué conciliación estamos mirando": banco, cuenta y período.
// Se setea al correr una conciliación nueva, y se lee desde la página de
// resultados (incluso si el usuario llega ahí por recarga directa de la URL).
export function useReconciliationContext() {
  const [context, setContextState] = useState(() => readStoredContext())

  const setContext = useCallback((newContext) => {
    setContextState(newContext)
    writeStoredContext(newContext)
  }, [])

  return { context, setContext }
}
