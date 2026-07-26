import { useState, useEffect, useCallback } from 'react'
import { reconciliationApi } from '../api/reconciliation'
import { useReconciliationContext } from './useReconciliationContext'

export function useReconciliationResults({ autoFetch = true } = {}) {
  const { context } = useReconciliationContext()
  const [results, setResults] = useState(null)
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    if (!context) {
      setError('No hay una conciliación corrida todavía en esta sesión.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [resultsData, balanceData] = await Promise.all([
        reconciliationApi.getResults(context),
        reconciliationApi.getBalance(context),
      ])
      setResults(resultsData)
      setBalance(balanceData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [context])

  useEffect(() => {
    if (autoFetch) fetchAll()
  }, [autoFetch, fetchAll])

  return { results, balance, loading, error, refetch: fetchAll }
}
