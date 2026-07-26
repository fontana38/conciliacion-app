import { useNavigate } from 'react-router-dom'
import { useReconciliationFlow, STEP_STATUS } from '../hooks/useReconciliationFlow'
import { BANK_ACCOUNTS } from '../utils/bankAccounts'
import FileDropzone from '../components/FileDropzone'
import './UploadPage.css'

export default function UploadPage() {
  const navigate = useNavigate()
  const {
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
  } = useReconciliationFlow()

  const handleRun = async () => {
    const ok = await runReconciliation()
    if (ok) navigate('/resultados')
  }

  const isRunning = runStatus === STEP_STATUS.LOADING
  const filesDisabled = isRunning || !contextIsValid

  const handleAccountChange = (e) => {
    const selected = BANK_ACCOUNTS.find(
      (b) => `${b.bankCode}__${b.bankAccount}` === e.target.value
    )
    if (selected) {
      setBankCode(selected.bankCode)
      setBankAccount(selected.bankAccount)
    }
  }

  return (
    <div className="upload-page">
      <div className="upload-page__intro">
        <p className="upload-page__eyebrow">Paso 1 de 3</p>
        <h2 className="upload-page__title">Cargar los dos extractos del período</h2>
        <p className="upload-page__copy">
          Elegí la cuenta y el período, y después subí el movimiento bancario y el
          movimiento del sistema. El motor de conciliación los va a cruzar por fecha,
          monto y contraparte.
        </p>
      </div>

      <div className="upload-page__context">
        <label className="upload-page__field">
          <span className="upload-page__field-label">Cuenta bancaria</span>
          <select
            className="upload-page__select"
            value={`${bankCode}__${bankAccount}`}
            onChange={handleAccountChange}
            disabled={isRunning}
          >
            {BANK_ACCOUNTS.map((b) => (
              <option key={`${b.bankCode}__${b.bankAccount}`} value={`${b.bankCode}__${b.bankAccount}`}>
                {b.label}
              </option>
            ))}
          </select>
        </label>

        <label className="upload-page__field">
          <span className="upload-page__field-label">Período</span>
          <input
            type="month"
            className="upload-page__input"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            disabled={isRunning}
          />
        </label>
      </div>

      <div className="upload-page__grid">
        <FileDropzone
          label="Extracto del banco"
          hint="Excel exportado de Supervielle (.xlsx)"
          status={bankUploadStatus}
          fileName={bankFile?.name}
          onFileSelected={uploadBank}
          disabled={filesDisabled}
        />
        <FileDropzone
          label="Movimientos del sistema"
          hint="Excel exportado del ERP / sistema contable"
          status={systemUploadStatus}
          fileName={systemFile?.name}
          onFileSelected={uploadSystem}
          disabled={filesDisabled}
        />
      </div>

      {!contextIsValid && (
        <p className="upload-page__context-hint">
          Elegí un período válido (mes y año) para habilitar la carga de archivos.
        </p>
      )}

      {error && (
        <div className="upload-page__error" role="alert">
          {error}
        </div>
      )}

      <div className="upload-page__actions">
        <button
          className="btn btn--primary"
          disabled={!bothFilesReady || isRunning}
          onClick={handleRun}
        >
          {isRunning ? 'Conciliando…' : 'Correr conciliación'}
        </button>
        {!bothFilesReady && (
          <p className="upload-page__actions-hint">
            Cargá ambos archivos para habilitar este paso.
          </p>
        )}
      </div>
    </div>
  )
}
