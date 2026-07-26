import StatusStamp from './StatusStamp'
import { formatCurrency, formatDateTime } from '../utils/format'
import './SimpleMovementsTable.css'

export default function SimpleMovementsTable({ items, stampKind }) {
  if (!items || items.length === 0) {
    return <p className="simple-table__empty">No hay movimientos en esta categoría.</p>
  }

  return (
    <div className="simple-table__wrapper">
      <table className="simple-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Descripción</th>
            <th>Contraparte</th>
            <th>Documento</th>
            <th className="num">Monto</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id}>
              <td>{formatDateTime(item.date)}</td>
              <td>
                <div className="simple-table__concept">{item.concept || item.description}</div>
                {item.concept && item.description !== item.concept && (
                  <div className="simple-table__detail">{item.description}</div>
                )}
              </td>
              <td>{item.clientOrProvider || '—'}</td>
              <td>
                {item.document} {item.number}
              </td>
              <td className="num simple-table__amount">{formatCurrency(item.amount)}</td>
              <td>
                <StatusStamp kind={stampKind} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
