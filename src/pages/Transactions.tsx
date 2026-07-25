import { useEffect, useState } from 'react'
import { fetchOverview, fetchTransactions } from '../api/adminApi'
import { ApiError } from '../api/client'
import type { AdminTransaction, OverviewStats } from '../api/types'
import { IconChat } from '../components/Icons'
import { TransactionTable } from '../components/TransactionTable'
import { formatNgn } from '../utils/format'

type Filter = 'all' | 'deposit' | 'withdrawal' | 'vtu' | 'giftcard'

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'deposit', label: 'Deposits' },
  { id: 'withdrawal', label: 'Withdrawals' },
  { id: 'vtu', label: 'Airtime & Data' },
  { id: 'giftcard', label: 'Gift Cards' },
]

export function Transactions() {
  const [filter, setFilter] = useState<Filter>('all')
  const [rows, setRows] = useState<AdminTransaction[]>([])
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverview()
      .then(setStats)
      .catch(() => {
        // Summary cards just stay hidden if this fails — the table below is the primary content.
      })
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchTransactions({ type: filter, page_size: 50 })
      .then((data) => {
        if (cancelled) return
        setRows(data.results)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : 'Failed to load transactions.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [filter])

  return (
    <div className="transactions-page">
      <div className="page-intro">
        <h1>Transactions</h1>
        <p>All deposits, withdrawals, VTU and gift card purchases across the platform</p>
      </div>

      {stats && (
        <div className="tx-summary-row">
          <article className="card tx-summary-card">
            <span className="tx-summary-icon">
              <IconChat />
            </span>
            <div>
              <p className="tx-summary-label">Deposits</p>
              <p className="tx-summary-count">{stats.deposit_count}</p>
              <p className="tx-summary-amount">{formatNgn(stats.deposit_all_time_ngn)}</p>
            </div>
          </article>
          <article className="card tx-summary-card">
            <span className="tx-summary-icon">
              <IconChat />
            </span>
            <div>
              <p className="tx-summary-label">Withdrawals</p>
              <p className="tx-summary-count">{stats.withdrawal_count}</p>
              <p className="tx-summary-amount">{formatNgn(stats.withdrawal_all_time_ngn)}</p>
            </div>
          </article>
          <article className="card tx-summary-card">
            <span className="tx-summary-icon">
              <IconChat />
            </span>
            <div>
              <p className="tx-summary-label">Airtime & Data</p>
              <p className="tx-summary-count">{stats.vtu_count}</p>
              <p className="tx-summary-amount">{formatNgn(stats.vtu_total_ngn)}</p>
            </div>
          </article>
          <article className="card tx-summary-card">
            <span className="tx-summary-icon">
              <IconChat />
            </span>
            <div>
              <p className="tx-summary-label">Gift Cards</p>
              <p className="tx-summary-count">{stats.giftcard_count}</p>
              <p className="tx-summary-amount">{formatNgn(stats.giftcard_total_ngn)}</p>
            </div>
          </article>
        </div>
      )}

      <div className="filter-pills" role="tablist" aria-label="Transaction type filter">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`filter-pill ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="login-error">{error}</p>}

      <TransactionTable
        rows={rows}
        title={loading ? 'Loading transactions…' : 'Transaction log'}
        viewAllColor="purple"
      />
    </div>
  )
}
