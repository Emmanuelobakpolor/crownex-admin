import { Fragment, useEffect, useState } from 'react'
import { fetchVirtualCards } from '../api/adminApi'
import { ApiError } from '../api/client'
import type { AdminVirtualCard } from '../api/types'
import { StatusBadge } from '../components/Badges'
import { timeAgo } from '../utils/format'

const STATUS_FILTERS = ['all', 'pending', 'active', 'frozen', 'terminated']

export function Cards() {
  const [cards, setCards] = useState<AdminVirtualCard[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const timer = window.setTimeout(() => {
      fetchVirtualCards({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
        page_size: 50,
      })
        .then((data) => setCards(data.results))
        .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Failed to load cards.'))
        .finally(() => setLoading(false))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [statusFilter, search])

  return (
    <div className="cards-page">
      <div className="page-intro">
        <h1>Virtual cards</h1>
        <p>Issued Bitnob virtual cards — read-only visibility for support and reconciliation.</p>
      </div>

      <section className="card table-card crypto-ops-card">
        <div className="crypto-ops-toolbar">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All statuses' : s}
              </option>
            ))}
          </select>
          <input
            type="search"
            placeholder="Search masked PAN or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="users-search"
          />
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Masked PAN</th>
                <th>Brand</th>
                <th>Balance (USD)</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={6} className="login-error">
                    {error}
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan={6} className="cell-muted">
                    Loading…
                  </td>
                </tr>
              ) : cards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="cell-muted">
                    No cards found.
                  </td>
                </tr>
              ) : (
                cards.map((c) => {
                  const isExpanded = expanded === c.id
                  return (
                    <Fragment key={c.id}>
                      <tr className="crypto-ops-row" onClick={() => setExpanded(isExpanded ? null : c.id)}>
                        <td>{c.user_email}</td>
                        <td className="cell-muted">{c.masked_pan || '—'}</td>
                        <td className="cell-muted">{c.card_brand || '—'}</td>
                        <td>${c.balance_display}</td>
                        <td>
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="cell-muted">{timeAgo(c.created_at)}</td>
                      </tr>
                      {isExpanded && (
                        <tr className="crypto-ops-detail-row">
                          <td colSpan={6}>
                            <div className="kyc-detail">
                              <div className="kyc-detail-meta">
                                <p>
                                  <strong>Cardholder:</strong> {c.cardholder_name || '—'}
                                </p>
                                <p>
                                  <strong>Provisioning status:</strong> {c.created_status || '—'}
                                </p>
                              </div>
                              {c.transactions.length > 0 && (
                                <>
                                  <p className="crypto-ops-note">Transactions</p>
                                  <ul className="crypto-ops-log">
                                    {c.transactions.map((tx) => (
                                      <li key={tx.reference}>
                                        <span className="cell-muted">{timeAgo(tx.created_at)}</span> —{' '}
                                        <strong>{tx.type}</strong> ${tx.amount_display} ({tx.status})
                                        {tx.ngn_amount ? ` — ₦${tx.ngn_amount}` : ''}
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              )}
                              <ul className="crypto-ops-log">
                                {c.logs.map((log, i) => (
                                  <li key={i}>
                                    <span className="cell-muted">{timeAgo(log.created_at)}</span> —{' '}
                                    <strong>{log.event}</strong>
                                    {log.detail ? `: ${log.detail}` : ''}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
