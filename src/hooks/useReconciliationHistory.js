import { useState, useEffect, useCallback } from 'react'
import { reconciliationApi } from '../api/reconciliation'

export function useReconciliationHistory() {
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await reconciliationApi.getHistory()
      setHistory(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { history, loading, error, refetch: fetchHistory }
}
