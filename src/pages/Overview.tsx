import { useEffect, useState } from 'react'
import { fetchOverview, fetchTransactions } from '../api/adminApi'
import { ApiError } from '../api/client'
import type { AdminTransaction, OverviewStats } from '../api/types'
import { IconFemale, IconMale, IconReceipt, IconUsersCircle } from '../components/Icons'
import { TransactionTable } from '../components/TransactionTable'
import { formatNgn, formatNumber } from '../utils/format'

interface Props {
  onViewAllTransactions?: () => void
  onViewAllUsers?: () => void
}

export function Overview({ onViewAllTransactions, onViewAllUsers }: Props) {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [recent, setRecent] = useState<AdminTransaction[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([fetchOverview(), fetchTransactions({ page_size: 6 })])
      .then(([overview, transactions]) => {
        if (cancelled) return
        setStats(overview)
        setRecent(transactions.results)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : 'Failed to load dashboard data.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="overview-page">
        <p className="cell-muted">Loading dashboard…</p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="overview-page">
        <p className="login-error">{error ?? 'Something went wrong.'}</p>
      </div>
    )
  }

  return (
    <div className="overview-page">
      <div className="stat-row">
        <article className="card stat-card">
          <div className="stat-top">
            <span className="stat-icon icon-green">
              <IconUsersCircle />
            </span>
            <div>
              <p className="stat-label">Total Users</p>
              <p className="stat-value">{stats.total_users.toLocaleString()}</p>
            </div>
          </div>
          <div className="stat-footer">
            <button type="button" className="link-muted" onClick={onViewAllUsers}>
              View All &gt;
            </button>
            {stats.new_users_growth_pct !== null && (
              <span className={stats.new_users_growth_pct >= 0 ? 'pct-up' : 'pct-down'}>
                {stats.new_users_growth_pct >= 0 ? '↑' : '↓'} {Math.abs(stats.new_users_growth_pct)}%
              </span>
            )}
          </div>
        </article>

        <article className="card stat-card">
          <div className="stat-top">
            <span className="stat-icon icon-teal">
              <IconMale />
            </span>
            <div>
              <p className="stat-label">Total Deposit Today</p>
              <p className="stat-value">{formatNgn(stats.deposit_today_ngn)}</p>
            </div>
          </div>
          <div className="stat-footer">
            <button type="button" className="link-muted" onClick={onViewAllTransactions}>
              View All &gt;
            </button>
          </div>
        </article>

        <article className="card stat-card">
          <div className="stat-top">
            <span className="stat-icon icon-blue">
              <IconFemale />
            </span>
            <div>
              <p className="stat-label">All-Time Deposits</p>
              <p className="stat-value">{formatNgn(stats.deposit_all_time_ngn)}</p>
            </div>
          </div>
          <div className="stat-footer">
            <span className="cell-muted">{stats.deposit_count} total deposits</span>
          </div>
        </article>

        <article className="card stat-card">
          <div className="stat-top">
            <span className="stat-icon icon-amber">
              <IconReceipt />
            </span>
            <div>
              <p className="stat-label">Total Withdrawal</p>
              <p className="stat-value">{formatNgn(stats.withdrawal_all_time_ngn)}</p>
            </div>
          </div>
          <div className="stat-footer">
            <span className="cell-muted">{stats.withdrawal_count} total withdrawals</span>
          </div>
        </article>
      </div>

      <div className="amount-row">
        <article className="card amount-card">
          <p className="amount-label">VTU Purchases (Airtime &amp; Data)</p>
          <p className="amount-value">
            {formatNumber(stats.vtu_total_ngn)} <span className="amount-unit">NGN</span>
          </p>
        </article>
        <article className="card amount-card">
          <p className="amount-label">Gift Card Purchases</p>
          <p className="amount-value">
            {formatNumber(stats.giftcard_total_ngn)} <span className="amount-unit">NGN</span>
          </p>
        </article>
      </div>

      <TransactionTable
        rows={recent}
        title="Recent Transactions"
        viewAllColor="green"
        onViewAll={onViewAllTransactions}
      />
    </div>
  )
}
