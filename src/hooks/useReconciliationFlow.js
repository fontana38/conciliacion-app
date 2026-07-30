import { useState, useCallback,useRef  } from 'react'
import { reconciliationApi } from '../api/reconciliation'
import { BANK_ACCOUNTS } from '../utils/bankAccounts'
import { useReconciliationContext } from './useReconciliationContext'

// Estados posibles de cada paso del flujo
export const STEP_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  DONE: 'done',
  ERROR: 'error',
}

function getCurrentPeriod() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${now.getFullYear()}-${month}`
}



export function useReconciliationFlow() {
  const { setContext } = useReconciliationContext()

  const conciliationDeletedRef = useRef(false)
  const deletionPromiseRef = useRef(null)

  const [bankCode, setBankCode] = useState(
    BANK_ACCOUNTS[0]?.bankCode ?? ''
  )
  const [bankAccount, setBankAccount] = useState(
    BANK_ACCOUNTS[0]?.bankAccount ?? ''
  )
  const [period, setPeriod] = useState(getCurrentPeriod())

  const [bankFile, setBankFile] = useState(null)
  const [systemFile, setSystemFile] = useState(null)

  const [bankUploadStatus, setBankUploadStatus] = useState(
    STEP_STATUS.IDLE
  )
  const [systemUploadStatus, setSystemUploadStatus] = useState(
    STEP_STATUS.IDLE
  )
  const [runStatus, setRunStatus] = useState(STEP_STATUS.IDLE)

  const [error, setError] = useState(null)

  const periodIsValid = /^\d{4}-\d{2}$/.test(period)

  const contextIsValid =
    Boolean(bankCode) &&
    Boolean(bankAccount) &&
    periodIsValid

  const ensureConciliationDeleted = useCallback(async () => {
    if (conciliationDeletedRef.current) {
      return
    }

    // Si el borrado ya comenzó, las demás cargas esperan la misma promesa.
    if (deletionPromiseRef.current) {
      await deletionPromiseRef.current
      return
    }

    deletionPromiseRef.current =
      reconciliationApi.deleteConciliation()

    try {
      await deletionPromiseRef.current
      conciliationDeletedRef.current = true
    } finally {
      deletionPromiseRef.current = null
    }
  }, [])

  const uploadBank = useCallback(
    async (file) => {
      setBankFile(file)
      setBankUploadStatus(STEP_STATUS.LOADING)
      setError(null)

      try {
        await ensureConciliationDeleted()

        await reconciliationApi.uploadBankFile(file, {
          bankCode,
          bankAccount,
          period,
        })

        setBankUploadStatus(STEP_STATUS.DONE)
      } catch (err) {
        setBankUploadStatus(STEP_STATUS.ERROR)
        setError(err.message)
      }
    },
    [
      bankCode,
      bankAccount,
      period,
      ensureConciliationDeleted,
    ]
  )

  const uploadSystem = useCallback(
    async (file) => {
      setSystemFile(file)
      setSystemUploadStatus(STEP_STATUS.LOADING)
      setError(null)

      try {
        await ensureConciliationDeleted()

        await reconciliationApi.uploadSystemFile(file, {
          bankCode,
          bankAccount,
          period,
        })

        setSystemUploadStatus(STEP_STATUS.DONE)
      } catch (err) {
        setSystemUploadStatus(STEP_STATUS.ERROR)
        setError(err.message)
      }
    },
    [
      bankCode,
      bankAccount,
      period,
      ensureConciliationDeleted,
    ]
  )

  const runReconciliation = useCallback(async () => {
    setRunStatus(STEP_STATUS.LOADING)
    setError(null)

    try {
      await reconciliationApi.run({
        bankCode,
        bankAccount,
        period,
      })

      setContext({
        bankCode,
        bankAccount,
        period,
      })

      setRunStatus(STEP_STATUS.DONE)
      return true
    } catch (err) {
      setRunStatus(STEP_STATUS.ERROR)
      setError(err.message)
      return false
    }
  }, [
    bankCode,
    bankAccount,
    period,
    setContext,
  ])

  const reset = useCallback(() => {
    setBankFile(null)
    setSystemFile(null)

    setBankUploadStatus(STEP_STATUS.IDLE)
    setSystemUploadStatus(STEP_STATUS.IDLE)
    setRunStatus(STEP_STATUS.IDLE)

    setError(null)

    conciliationDeletedRef.current = false
    deletionPromiseRef.current = null
  }, [])

  const bothFilesReady =
    bankUploadStatus === STEP_STATUS.DONE &&
    systemUploadStatus === STEP_STATUS.DONE

  return {
    bankCode,
    setBankCode,
    bankAccount,
    setBankAccount,
    period,
    setPeriod,
    contextIsValid,
    bankFile,
    systemFile,
    bankUploadStatus,
    systemUploadStatus,
    runStatus,
    error,
    bothFilesReady,
    uploadBank,
    uploadSystem,
    runReconciliation,
    reset,
  }
}