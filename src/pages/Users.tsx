import { useEffect, useState } from 'react'
import { fetchUsers } from '../api/adminApi'
import { ApiError } from '../api/client'
import type { AdminUser } from '../api/types'
import { StatusBadge } from '../components/Badges'
import { formatNgn, timeAgo } from '../utils/format'

export function Users() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [count, setCount] = useState(0)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const timer = window.setTimeout(() => {
      fetchUsers({ search, page_size: 50 })
        .then((data) => {
          if (cancelled) return
          setUsers(data.results)
          setCount(data.count)
        })
        .catch((err: unknown) => {
          if (cancelled) return
          setError(err instanceof ApiError ? err.message : 'Failed to load users.')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [search])

  return (
    <div className="users-page">
      <div className="users-count-bar">
        <p>
          Number of Users: <strong>{count}</strong>
        </p>
        <input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="users-search"
          aria-label="Search users"
        />
      </div>

      <section className="card table-card users-table-card">
        <div className="table-wrap">
          <table className="data-table users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={4} className="login-error">
                    {error}
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan={4} className="cell-muted">
                    Loading…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="cell-muted">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </td>
                    <td>{formatNgn(user.balance_ngn)}</td>
                    <td>
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="cell-muted">{timeAgo(user.last_active)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
