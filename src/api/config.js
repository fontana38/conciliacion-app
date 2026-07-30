// ── Configuración de la API ──────────────────────────────────────────────
// Todos los endpoints del backend de conciliación viven acá.
// Si cambian las rutas, alcanza con editar este archivo.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

console.log('API_BASE_URL:', API_BASE_URL,import.meta.env.VITE_API_BASE_URL)

export const ENDPOINTS = {
  importBank: '/imports/bank',
  importSystem: '/imports/system',
  deleteConciliation: '/imports/delete-Conciliation',
  runReconciliation: '/reconciliation/run',
  results: '/reconciliation/results',
  balance: '/reconciliation/balance',
  // No nos pasaron un endpoint de historial todavía.
  // Dejamos el nombre más probable como placeholder; cambiar acá cuando se confirme.
  history: '/reconciliation/history',
  historyDetail: (id) => `/reconciliation/${id}`,
}

export const AUTH_TOKEN_STORAGE_KEY = 'conciliacion_token'
