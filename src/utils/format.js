// Tolerancia para considerar una diferencia como "redondeo" en vez de "alerta real".
// Ajustable: ver conversación con el equipo de backend sobre el algoritmo de matching.
export const ROUNDING_TOLERANCE = 100

export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value))
  return value < 0 ? `-$${formatted}` : `$${formatted}`
}

export function formatDate(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return isoString
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return isoString
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Clasifica un match según su diferencia de monto.
// 'exact'   → diferencia $0
// 'rounding'→ diferencia chica, dentro de tolerancia (probable redondeo/comisión)
// 'alert'   → diferencia grande, requiere revisión manual
export function classifyDifference(difference) {
  const abs = Math.abs(difference ?? 0)
  if (abs === 0) return 'exact'
  if (abs <= ROUNDING_TOLERANCE) return 'rounding'
  return 'alert'
}

export const DIFFERENCE_LABEL = {
  exact: 'Conciliado',
  rounding: 'Redondeo',
  alert: 'Revisar',
}
