import { Link } from 'react-router-dom'
import { useReconciliationHistory } from '../hooks/useReconciliationHistory'
import { formatDate, formatCurrency } from '../utils/format'
import './HistoryPage.css'

export default function HistoryPage() {
  const { history, loading, error, refetch } = useReconciliationHistory()

  if (loading) return <p className="history-page__loading">Cargando historial…</p>

  if (error) {
    return (
      <div className="history-page__error">
        <p>{error}</p>
        <p className="history-page__error-note">
          Nota: el endpoint de historial todavía es un placeholder (<code>GET /reconciliation/history</code>).
          Si el backend usa otra ruta, actualizala en <code>src/api/config.js</code>.
        </p>
        <button className="btn btn--secondary" onClick={refetch}>
          Reintentar
        </button>
      </div>
    )
  }

  const items = Array.isArray(history) ? history : history?.items ?? []

  return (
    <div className="history-page">
      <p className="history-page__eyebrow">Conciliaciones pasadas</p>
      <h2 className="history-page__title">Historial</h2>

      {items.length === 0 ? (
        <p className="history-page__empty">Todavía no hay conciliaciones registradas.</p>
      ) : (
        <div className="history-page__table-wrapper">
          <table className="history-page__table">
            <thead>
              <tr>
                <th>Período</th>
                <th>Cuenta</th>
                <th>Corrida el</th>
                <th className="num">Conciliados</th>
                <th className="num">Sin matchear</th>
                <th className="num">Diferencia</th>
                <th aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id ?? item._id}>
                  <td>{item.period}</td>
                  <td>
                    {item.bankCode} {item.bankAccount}
                  </td>
                  <td>{formatDate(item.createdAt ?? item.runAt)}</td>
                  <td className="num">{item.matchedCount ?? '—'}</td>
                  <td className="num">{item.unmatchedCount ?? '—'}</td>
                  <td className="num">{formatCurrency(item.difference)}</td>
                  <td>
                    <Link className="btn btn--ghost history-page__link" to={`/historial/${item.id ?? item._id}`}>
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
