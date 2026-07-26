import { useState, useMemo } from 'react'
import { useReconciliationResults } from '../hooks/useReconciliationResults'
import SummaryCard from '../components/SummaryCard'
import Tabs from '../components/Tabs'
import MatchesTable from '../components/MatchesTable'
import SimpleMovementsTable from '../components/SimpleMovementsTable'
import { formatCurrency, classifyDifference } from '../utils/format'
import { exportReconciliationToExcel } from '../utils/exportReconciliationToExcel'
import './ResultsPage.css'

export default function ResultsPage() {
  const { results, balance, loading, error, refetch } = useReconciliationResults()
  const [activeTab, setActiveTab] = useState('matches')
  const [searchText, setSearchText] = useState('')

  const groups = results?.matchedGroups ?? []
  console.log('matchedGroups:', results?.matchedGroups)
  const bankOnly = results?.bankOnly ?? []
  const systemOnly = results?.systemOnly ?? []

  const normalize = (value) =>
    String(value ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()

  const matchesSearch = (item, search) => {
    if (!search) return true

    const query = normalize(search)

    return normalize(JSON.stringify(item)).includes(query)
  }

  const filteredGroups = useMemo(
    () => groups.filter((item) => matchesSearch(item, searchText)),
    [groups, searchText]
  )

  const filteredBankOnly = useMemo(
    () => bankOnly.filter((item) => matchesSearch(item, searchText)),
    [bankOnly, searchText]
  )

  const filteredSystemOnly = useMemo(
    () => systemOnly.filter((item) => matchesSearch(item, searchText)),
    [systemOnly, searchText]
  )

  const alertCount = useMemo(
    () => groups.filter((g) => classifyDifference(g.difference) === 'alert').length,
    [groups]
  )

  if (loading) {
    return <p className="results-page__loading">Cargando resultados…</p>
  }

  if (error) {
    return (
      <div className="results-page__error">
        <p>{error}</p>

        <button className="btn btn--secondary" onClick={refetch}>
          Reintentar
        </button>
      </div>
    )
  }

  if (!results) {
    return (
      <p className="results-page__empty">
        Todavía no hay una conciliación corrida. Subí los archivos y corré el proceso primero.
      </p>
    )
  }

  const summary = results.summary

  const handleExportExcel = () => {
    exportReconciliationToExcel(
      results,
      balance,
      results.bankCode,
      results.bankAccount,
      results.period
    )
  }

  return (
    <div className="results-page">
      <div className="results-page__header">
        <div>
          <p className="results-page__eyebrow">
            {results.bankCode} · {results.bankAccount} · Período {results.period}
          </p>

          <h2 className="results-page__title">
            Resultado de la conciliación
          </h2>
        </div>

        <div className="results-page__actions">
          <button
            className="btn btn--secondary"
            onClick={handleExportExcel}
          >
            Exportar Excel
          </button>

          <button className="btn btn--ghost" onClick={refetch}>
            Actualizar
          </button>
        </div>
      </div>

      <div className="results-page__cards">
        <SummaryCard
          label="Movimientos banco"
          value={summary?.bank?.total ?? '—'}
          sublabel={`${summary?.bank?.matched ?? 0} conciliados · ${
            summary?.bank?.unmatched ?? 0
          } sin matchear`}
        />

        <SummaryCard
          label="Movimientos sistema"
          value={summary?.system?.total ?? '—'}
          sublabel={`${summary?.system?.matched ?? 0} conciliados · ${
            summary?.system?.unmatched ?? 0
          } sin matchear`}
        />

        <SummaryCard
          label="Grupos conciliados"
          value={groups.length}
          tone="moss"
        />

        <SummaryCard
          label="Para revisar"
          value={alertCount}
          tone={alertCount > 0 ? 'brick' : 'moss'}
          sublabel="Diferencia mayor a la tolerancia de redondeo"
        />
      </div>

      {balance && (
        <div
          className={`results-page__balance results-page__balance--${
            balance.balances ? 'ok' : 'off'
          }`}
        >
          <span className="results-page__balance-label">
            {balance.balances
              ? 'La conciliación cierra'
              : 'La conciliación no cierra'}
          </span>

          {balance.difference !== undefined && (
            <span className="num results-page__balance-amount">
              {formatCurrency(balance.difference)}
            </span>
          )}
        </div>
      )}

      <div className="results-page__tabs-row">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            {
              key: 'matches',
              label: 'Conciliados',
              count: filteredGroups.length,
            },
            {
              key: 'bankOnly',
              label: 'Solo en banco',
              count: filteredBankOnly.length,
            },
            {
              key: 'systemOnly',
              label: 'Solo en sistema',
              count: filteredSystemOnly.length,
            },
          ]}
        />

        <input
          className="results-page__search"
          type="search"
          placeholder="Buscar movimiento..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </div>

      {activeTab === 'matches' && (
        <MatchesTable groups={filteredGroups} />
      )}

      {activeTab === 'bankOnly' && (
        <SimpleMovementsTable
          items={filteredBankOnly}
          stampKind="bankOnly"
        />
      )}

      {activeTab === 'systemOnly' && (
        <SimpleMovementsTable
          items={filteredSystemOnly}
          stampKind="systemOnly"
        />
      )}
    </div>
  )
}