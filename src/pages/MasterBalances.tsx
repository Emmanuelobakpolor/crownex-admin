import { useCallback, useEffect, useState } from 'react'
import { fetchMasterBalances } from '../api/adminApi'
import { ApiError } from '../api/client'
import type { MasterBalances as MasterBalancesData, MasterBalanceRow } from '../api/types'
import { timeAgo } from '../utils/format'

function formatAmount(value: string, coin: string): string {
  const num = Number(value)
  if (Number.isNaN(num)) return value
  const digits = coin === 'ngn' ? 2 : 8
  return num.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: digits })
}

function isShort(row: MasterBalanceRow): boolean {
  return Number(row.difference) < 0
}

function hasAnything(row: MasterBalanceRow): boolean {
  return Number(row.master_balance) > 0 || Number(row.master_locked) > 0 || Number(row.users_total) > 0
}

export function MasterBalances() {
  const [data, setData] = useState<MasterBalancesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEmpty, setShowEmpty] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchMasterBalances()
      .then(setData)
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Failed to load balances.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const rows = (data?.rows ?? []).filter((r) => showEmpty || hasAnything(r))
  const shortCoins = (data?.rows ?? []).filter((r) => r.coin !== 'ngn' && isShort(r))

  return (
    <div className="master-balances-page">
      <div className="page-intro">
        <h1>Master account</h1>
        <p>
          What the Quidax master account really holds, next to what users own in the app. If users own more
          than the master account holds, swaps, sells and withdrawals of that coin will fail with "insufficient
          balance".
        </p>
      </div>

      {shortCoins.length > 0 && (
        <p className="settings-msg settings-msg-err master-balances-alert">
          Not fully backed: {shortCoins.map((r) => r.coin.toUpperCase()).join(', ')}. Buy the shortfall on the
          Quidax master account, or move those users' balances back.
        </p>
      )}

      <section className="card table-card">
        <div className="crypto-ops-toolbar">
          <button type="button" className="crypto-ops-action-btn" onClick={load} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          <label className="master-balances-toggle">
            <input type="checkbox" checked={showEmpty} onChange={(e) => setShowEmpty(e.target.checked)} />
            Show empty coins
          </label>
          {data && <span className="cell-muted">Updated {timeAgo(data.fetched_at)}</span>}
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Coin</th>
                <th>Master balance</th>
                <th>Master locked</th>
                <th>Users own</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={5} className="login-error">
                    {error}
                  </td>
                </tr>
              ) : loading && !data ? (
                <tr>
                  <td colSpan={5} className="cell-muted">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="cell-muted">
                    Nothing held.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const short = isShort(row)
                  return (
                    <tr key={row.coin}>
                      <td className="cell-asset">
                        <strong>{row.coin.toUpperCase()}</strong> <span className="cell-muted">{row.name}</span>
                        {!row.supported && <span className="cell-muted"> · not in app</span>}
                      </td>
                      <td>{formatAmount(row.master_balance, row.coin)}</td>
                      <td className="cell-muted">{formatAmount(row.master_locked, row.coin)}</td>
                      <td>
                        {formatAmount(row.users_total, row.coin)}
                        {Number(row.users_reserved) > 0 && (
                          <span className="cell-muted"> ({formatAmount(row.users_reserved, row.coin)} in flight)</span>
                        )}
                      </td>
                      <td className={short ? 'master-balances-short' : 'master-balances-ok'}>
                        {Number(row.difference) > 0 ? '+' : ''}
                        {formatAmount(row.difference, row.coin)}
                        {short && ' short'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="cell-muted master-balances-footnote">
        "Users own" is every user's available + in-flight balance in the app. For NGN it's the users' naira
        wallets, which may be funded outside Quidax (e.g. Flutterwave), so an NGN shortfall isn't necessarily a
        problem. Crypto deposits waiting to be swept from sub-accounts also show up as a temporary shortfall.
      </p>
    </div>
  )
}
