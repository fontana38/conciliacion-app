import './StatusStamp.css'

const STAMP_CONFIG = {
  exact: { label: 'CONCILIADO', tone: 'moss' },
  rounding: { label: 'REDONDEO', tone: 'amber' },
  alert: { label: 'REVISAR', tone: 'brick' },
  bankOnly: { label: 'SOLO BANCO', tone: 'amber' },
  systemOnly: { label: 'SOLO SISTEMA', tone: 'ink' },
}

export default function StatusStamp({ kind, rotate = -3 }) {
  const config = STAMP_CONFIG[kind] ?? { label: kind, tone: 'ink' }
  return (
    <span
      className={`status-stamp status-stamp--${config.tone}`}
      style={{ '--stamp-rotate': `${rotate}deg` }}
    >
      {config.label}
    </span>
  )
}
