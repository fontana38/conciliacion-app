import { useState } from 'react'
import StatusStamp from './StatusStamp'
import { formatCurrency, formatDateTime, classifyDifference } from '../utils/format'
import './MatchesTable.css'

function MatchRow({ group }) {
  const [expanded, setExpanded] = useState(false)
  const kind = classifyDifference(group.difference)
  const hasMultipleSystemRows = group.system?.length > 1

  return (
    <>
      <tr
        className={`matches-table__row matches-table__row--${kind}`}
        onClick={() => hasMultipleSystemRows && setExpanded((v) => !v)}
        style={{ cursor: hasMultipleSystemRows ? 'pointer' : 'default' }}
      >
        <td className="matches-table__expand-cell">
          {hasMultipleSystemRows && <span className="matches-table__caret">{expanded ? '▾' : '▸'}</span>}
        </td>
        <td>{formatDateTime(group.bank?.date)}</td>
        <td>
          <div className="matches-table__concept">{group.bank?.concept}</div>
          <div className="matches-table__detail">{group.bank?.description}</div>
        </td>
        <td className="num matches-table__amount">{formatCurrency(group.bankAmount)}</td>
        <td>
          {hasMultipleSystemRows ? (
            <span className="matches-table__multi">{group.system.length} movimientos</span>
          ) : (
            <>
              <div className="matches-table__concept">{group.system?.[0]?.clientOrProvider}</div>
              <div className="matches-table__detail">
                {group.system?.[0]?.document} {group.system?.[0]?.number}
              </div>
            </>
          )}
        </td>
        <td className="num matches-table__amount">{formatCurrency(group.systemAmount)}</td>
        <td className="num matches-table__amount matches-table__amount--diff">
          {formatCurrency(group.difference)}
        </td>
        <td>
          <StatusStamp kind={kind} />
        </td>
      </tr>
      {expanded &&
        group.system.map((sysRow) => (
          <tr key={sysRow._id} className="matches-table__subrow">
            <td />
            <td className="matches-table__detail">{formatDateTime(sysRow.date)}</td>
            <td colSpan={1}>
              <div className="matches-table__concept">{sysRow.clientOrProvider}</div>
              <div className="matches-table__detail">
                {sysRow.document} {sysRow.number}
              </div>
            </td>
            <td />
            <td />
            <td className="num matches-table__amount">{formatCurrency(sysRow.amount)}</td>
            <td />
            <td />
          </tr>
        ))}
    </>
  )
}

export default function MatchesTable({ groups }) {
  if (!groups || groups.length === 0) {
    return <p className="matches-table__empty">No hay matches para mostrar.</p>
  }

  return (
    <div className="matches-table__wrapper">
      <table className="matches-table">
        <thead>
          <tr>
            <th aria-hidden="true" />
            <th>Fecha</th>
            <th>Banco</th>
            <th className="num">Monto banco</th>
            <th>Sistema</th>
            <th className="num">Monto sistema</th>
            <th className="num">Diferencia</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <MatchRow key={group.reconciliationId} group={group} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
