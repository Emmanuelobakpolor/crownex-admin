import { Fragment, useEffect, useState } from 'react'
import {
  actOnCryptoOrder,
  actOnCryptoWithdrawal,
  fetchCryptoOrders,
  fetchCryptoWithdrawals,
} from '../api/adminApi'
import { ApiError } from '../api/client'
import type { AdminCryptoOrder, AdminCryptoWithdrawal } from '../api/types'
import { StatusBadge } from '../components/Badges'
import { formatNgn, formatNumber, timeAgo } from '../utils/format'

type Tab = 'orders' | 'withdrawals'

const ORDER_STATUS_FILTERS = [
  'all',
  'pending_payment',
  'payment_received',
  'waiting_deposit',
  'processing',
  'completed',
  'failed',
]

const WITHDRAWAL_STATUS_FILTERS = ['all', 'processing', 'completed', 'failed', 'rejected']

function orderActions(order: AdminCryptoOrder): { action: 'approve' | 'reject' | 'confirm_deposit' | 'retry'; label: string; needsNote?: boolean }[] {
  if (order.status === 'pending_payment') {
    return [
      { action: 'approve', label: 'Approve', needsNote: true },
      { action: 'reject', label: 'Reject', needsNote: true },
    ]
  }
  if (order.status === 'waiting_deposit') {
    return [
      { action: 'confirm_deposit', label: 'Confirm deposit' },
      { action: 'reject', label: 'Reject', needsNote: true },
    ]
  }
  if (order.status === 'failed' && order.order_type === 'buy') {
    return [{ action: 'retry', label: 'Retry' }]
  }
  return []
}

export function CryptoOps() {
  const [tab, setTab] = useState<Tab>('orders')

  const [orders, setOrders] = useState<AdminCryptoOrder[]>([])
  const [orderStatus, setOrderStatus] = useState('all')
  const [orderSearch, setOrderSearch] = useState('')
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [actingOrder, setActingOrder] = useState<string | null>(null)

  const [withdrawals, setWithdrawals] = useState<AdminCryptoWithdrawal[]>([])
  const [wdStatus, setWdStatus] = useState('all')
  const [wdSearch, setWdSearch] = useState('')
  const [wdLoading, setWdLoading] = useState(true)
  const [wdError, setWdError] = useState<string | null>(null)
  const [expandedWd, setExpandedWd] = useState<string | null>(null)
  const [actingWd, setActingWd] = useState<string | null>(null)

  function loadOrders() {
    setOrdersLoading(true)
    setOrdersError(null)
    fetchCryptoOrders({
      status: orderStatus === 'all' ? undefined : orderStatus,
      search: orderSearch || undefined,
      page_size: 50,
    })
      .then((data) => setOrders(data.results))
      .catch((err: unknown) => setOrdersError(err instanceof ApiError ? err.message : 'Failed to load orders.'))
      .finally(() => setOrdersLoading(false))
  }

  function loadWithdrawals() {
    setWdLoading(true)
    setWdError(null)
    fetchCryptoWithdrawals({
      status: wdStatus === 'all' ? undefined : wdStatus,
      search: wdSearch || undefined,
      page_size: 50,
    })
      .then((data) => setWithdrawals(data.results))
      .catch((err: unknown) => setWdError(err instanceof ApiError ? err.message : 'Failed to load withdrawals.'))
      .finally(() => setWdLoading(false))
  }

  useEffect(() => {
    const timer = window.setTimeout(loadOrders, 250)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderStatus, orderSearch])

  useEffect(() => {
    const timer = window.setTimeout(loadWithdrawals, 250)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wdStatus, wdSearch])

  async function handleOrderAction(
    order: AdminCryptoOrder,
    action: 'approve' | 'reject' | 'confirm_deposit' | 'retry',
    needsNote?: boolean,
  ) {
    const note = needsNote ? (window.prompt(`Note for "${action}" on ${order.reference} (optional):`) ?? '') : ''
    setActingOrder(order.reference)
    try {
      const updated = await actOnCryptoOrder(order.reference, action, note)
      setOrders((prev) => prev.map((o) => (o.reference === updated.reference ? updated : o)))
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Action failed.')
    } finally {
      setActingOrder(null)
    }
  }

  async function handleWithdrawalAction(withdrawal: AdminCryptoWithdrawal, action: 'complete' | 'reject') {
    let tx_id: string | undefined
    if (action === 'complete') {
      tx_id = window.prompt(`On-chain tx id for ${withdrawal.reference} (optional):`) ?? ''
    }
    const note = window.prompt(`Note for "${action}" on ${withdrawal.reference} (optional):`) ?? ''
    setActingWd(withdrawal.reference)
    try {
      const updated = await actOnCryptoWithdrawal(withdrawal.reference, action, { tx_id, note })
      setWithdrawals((prev) => prev.map((w) => (w.reference === updated.reference ? updated : w)))
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Action failed.')
    } finally {
      setActingWd(null)
    }
  }

  return (
    <div className="crypto-ops-page">
      <div className="page-intro">
        <h1>Crypto operations</h1>
        <p>Review buy/sell/swap orders and withdrawals, and step in when something needs a human.</p>
      </div>

      <div className="filter-pills" role="tablist" aria-label="Crypto ops tab">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'orders'}
          className={`filter-pill ${tab === 'orders' ? 'active' : ''}`}
          onClick={() => setTab('orders')}
        >
          Orders
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'withdrawals'}
          className={`filter-pill ${tab === 'withdrawals' ? 'active' : ''}`}
          onClick={() => setTab('withdrawals')}
        >
          Withdrawals
        </button>
      </div>

      {tab === 'orders' && (
        <section className="card table-card crypto-ops-card">
          <div className="crypto-ops-toolbar">
            <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
              {ORDER_STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All statuses' : s.replace('_', ' ')}
                </option>
              ))}
            </select>
            <input
              type="search"
              placeholder="Search reference or email…"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="users-search"
            />
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Coin</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ordersError ? (
                  <tr>
                    <td colSpan={8} className="login-error">
                      {ordersError}
                    </td>
                  </tr>
                ) : ordersLoading ? (
                  <tr>
                    <td colSpan={8} className="cell-muted">
                      Loading…
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="cell-muted">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const actions = orderActions(order)
                    const isExpanded = expandedOrder === order.reference
                    return (
                      <Fragment key={order.reference}>
                        <tr
                          className="crypto-ops-row"
                          onClick={() => setExpandedOrder(isExpanded ? null : order.reference)}
                        >
                          <td className="cell-muted">{order.reference}</td>
                          <td>{order.user_email}</td>
                          <td>
                            {order.order_type}
                            {order.order_type === 'swap' ? ` (${order.coin}→${order.to_coin})` : ''}
                          </td>
                          <td className="cell-asset">
                            {formatNumber(order.coin_amount)} {order.coin.toUpperCase()}
                          </td>
                          <td>{formatNgn(order.total_ngn)}</td>
                          <td>
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="cell-muted">{timeAgo(order.created_at)}</td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="crypto-ops-actions">
                              {actions.map((a) => (
                                <button
                                  key={a.action}
                                  type="button"
                                  className="crypto-ops-action-btn"
                                  disabled={actingOrder === order.reference}
                                  onClick={() => handleOrderAction(order, a.action, a.needsNote)}
                                >
                                  {a.label}
                                </button>
                              ))}
                              {actions.length === 0 && <span className="cell-muted">—</span>}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="crypto-ops-detail-row">
                            <td colSpan={8}>
                              {order.note && <p className="crypto-ops-note">Note: {order.note}</p>}
                              <ul className="crypto-ops-log">
                                {order.logs.map((log, i) => (
                                  <li key={i}>
                                    <span className="cell-muted">{timeAgo(log.created_at)}</span> —{' '}
                                    <strong>{log.event}</strong>
                                    {log.detail ? `: ${log.detail}` : ''}
                                  </li>
                                ))}
                              </ul>
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
      )}

      {tab === 'withdrawals' && (
        <section className="card table-card crypto-ops-card">
          <div className="crypto-ops-toolbar">
            <select value={wdStatus} onChange={(e) => setWdStatus(e.target.value)}>
              {WITHDRAWAL_STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All statuses' : s}
                </option>
              ))}
            </select>
            <input
              type="search"
              placeholder="Search reference or email…"
              value={wdSearch}
              onChange={(e) => setWdSearch(e.target.value)}
              className="users-search"
            />
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>User</th>
                  <th>Coin</th>
                  <th>Net amount</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wdError ? (
                  <tr>
                    <td colSpan={8} className="login-error">
                      {wdError}
                    </td>
                  </tr>
                ) : wdLoading ? (
                  <tr>
                    <td colSpan={8} className="cell-muted">
                      Loading…
                    </td>
                  </tr>
                ) : withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="cell-muted">
                      No withdrawals found.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((wd) => {
                    const isExpanded = expandedWd === wd.reference
                    return (
                      <Fragment key={wd.reference}>
                        <tr
                          className="crypto-ops-row"
                          onClick={() => setExpandedWd(isExpanded ? null : wd.reference)}
                        >
                          <td className="cell-muted">{wd.reference}</td>
                          <td>{wd.user_email}</td>
                          <td className="cell-asset">
                            {formatNumber(wd.net_amount)} {wd.coin.toUpperCase()}
                          </td>
                          <td>
                            {formatNumber(wd.net_amount)} {wd.coin.toUpperCase()}
                          </td>
                          <td className="cell-muted">{wd.address}</td>
                          <td>
                            <StatusBadge status={wd.status} />
                          </td>
                          <td className="cell-muted">{timeAgo(wd.created_at)}</td>
                          <td onClick={(e) => e.stopPropagation()}>
                            {wd.status === 'processing' ? (
                              <div className="crypto-ops-actions">
                                <button
                                  type="button"
                                  className="crypto-ops-action-btn"
                                  disabled={actingWd === wd.reference}
                                  onClick={() => handleWithdrawalAction(wd, 'complete')}
                                >
                                  Complete
                                </button>
                                <button
                                  type="button"
                                  className="crypto-ops-action-btn"
                                  disabled={actingWd === wd.reference}
                                  onClick={() => handleWithdrawalAction(wd, 'reject')}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="cell-muted">—</span>
                            )}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="crypto-ops-detail-row">
                            <td colSpan={8}>
                              {wd.tx_id && <p className="crypto-ops-note">tx_id: {wd.tx_id}</p>}
                              {wd.note && <p className="crypto-ops-note">Note: {wd.note}</p>}
                              <ul className="crypto-ops-log">
                                {wd.logs.map((log, i) => (
                                  <li key={i}>
                                    <span className="cell-muted">{timeAgo(log.created_at)}</span> —{' '}
                                    <strong>{log.event}</strong>
                                    {log.detail ? `: ${log.detail}` : ''}
                                  </li>
                                ))}
                              </ul>
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
      )}
    </div>
  )
}
