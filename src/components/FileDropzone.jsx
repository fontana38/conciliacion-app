import { useRef, useState, useCallback } from 'react'
import { STEP_STATUS } from '../hooks/useReconciliationFlow'
import './FileDropzone.css'

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv']

export default function FileDropzone({ label, hint, status, fileName, onFileSelected, disabled }) {
  const inputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFiles = useCallback(
    (fileList) => {
      const file = fileList?.[0]
      if (!file) return
      const isValid = ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
      if (!isValid) {
        alert(`Formato no soportado. Usá uno de: ${ACCEPTED_EXTENSIONS.join(', ')}`)
        return
      }
      onFileSelected(file)
    },
    [onFileSelected]
  )

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled) return
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div
      className={[
        'dropzone',
        isDragOver ? 'dropzone--dragover' : '',
        status === STEP_STATUS.DONE ? 'dropzone--done' : '',
        status === STEP_STATUS.ERROR ? 'dropzone--error' : '',
        disabled ? 'dropzone--disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) inputRef.current?.click()
      }}
      aria-disabled={disabled}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(',')}
        className="dropzone__input"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />

      <div className="dropzone__icon" aria-hidden="true">
        {status === STEP_STATUS.LOADING ? '⟳' : status === STEP_STATUS.DONE ? '✓' : status === STEP_STATUS.ERROR ? '!' : '↥'}
      </div>

      <p className="dropzone__label">{label}</p>

      {fileName ? (
        <p className="dropzone__filename num">{fileName}</p>
      ) : (
        <p className="dropzone__hint">{hint}</p>
      )}

      <p className="dropzone__status">
        {status === STEP_STATUS.LOADING && 'Subiendo…'}
        {status === STEP_STATUS.DONE && 'Cargado correctamente'}
        {status === STEP_STATUS.ERROR && 'No se pudo cargar — probá de nuevo'}
        {status === STEP_STATUS.IDLE && 'Arrastrá el archivo o hacé clic'}
      </p>
    </div>
  )
}
