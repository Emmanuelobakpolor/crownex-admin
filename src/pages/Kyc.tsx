import { Fragment, useEffect, useState } from 'react'
import { actOnKycVerification, fetchKycVerifications } from '../api/adminApi'
import { ApiError } from '../api/client'
import type { AdminKycVerification } from '../api/types'
import { StatusBadge } from '../components/Badges'
import { timeAgo } from '../utils/format'

const STATUS_FILTERS = ['all', 'pending', 'review', 'approved', 'rejected']

export function Kyc() {
  const [verifications, setVerifications] = useState<AdminKycVerification[]>([])
  const [statusFilter, setStatusFilter] = useState('review')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [acting, setActing] = useState<number | null>(null)

  function load() {
    setLoading(true)
    setError(null)
    fetchKycVerifications({
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: search || undefined,
      page_size: 50,
    })
      .then((data) => setVerifications(data.results))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Failed to load verifications.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = window.setTimeout(load, 250)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search])

  async function handleAction(verification: AdminKycVerification, action: 'approve' | 'reject') {
    const note = window.prompt(`Note for "${action}" on ${verification.user_email} (optional):`) ?? ''
    setActing(verification.id)
    try {
      const updated = await actOnKycVerification(verification.id, action, note)
      setVerifications((prev) => prev.map((v) => (v.id === updated.id ? updated : v)))
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Action failed.')
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="kyc-page">
      <div className="page-intro">
        <h1>KYC review</h1>
        <p>Review identity verifications that need a human decision — auto-approved and auto-rejected results are recorded too.</p>
      </div>

      <section className="card table-card crypto-ops-card">
        <div className="crypto-ops-toolbar">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All statuses' : s === 'review' ? 'Needs review' : s}
              </option>
            ))}
          </select>
          <input
            type="search"
            placeholder="Search ID number or email…"
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
                <th>ID type</th>
                <th>ID number</th>
                <th>Match score</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={7} className="login-error">
                    {error}
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan={7} className="cell-muted">
                    Loading…
                  </td>
                </tr>
              ) : verifications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="cell-muted">
                    No verifications found.
                  </td>
                </tr>
              ) : (
                verifications.map((v) => {
                  const isExpanded = expanded === v.id
                  const canAct = v.status === 'review' || v.status === 'pending'
                  return (
                    <Fragment key={v.id}>
                      <tr className="crypto-ops-row" onClick={() => setExpanded(isExpanded ? null : v.id)}>
                        <td>{v.user_email}</td>
                        <td className="cell-muted">{v.id_type.toUpperCase()}</td>
                        <td className="cell-muted">{v.id_number}</td>
                        <td>{v.match_score !== null ? `${v.match_score}%` : '—'}</td>
                        <td>
                          <StatusBadge status={v.status} />
                        </td>
                        <td className="cell-muted">{timeAgo(v.created_at)}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          {canAct ? (
                            <div className="crypto-ops-actions">
                              <button
                                type="button"
                                className="crypto-ops-action-btn"
                                disabled={acting === v.id}
                                onClick={() => handleAction(v, 'approve')}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                className="crypto-ops-action-btn"
                                disabled={acting === v.id}
                                onClick={() => handleAction(v, 'reject')}
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
                          <td colSpan={7}>
                            <div className="kyc-detail">
                              <div className="kyc-detail-meta">
                                <p>
                                  <strong>Full name:</strong> {v.full_name || '—'}
                                </p>
                                <p>
                                  <strong>Date of birth:</strong> {v.date_of_birth || '—'}
                                </p>
                                <p>
                                  <strong>Address:</strong> {v.address || '—'}
                                </p>
                                <p>
                                  <strong>Reference:</strong> {v.reference_id || '—'}
                                </p>
                                {v.reviewer_note && (
                                  <p>
                                    <strong>Reviewer note:</strong> {v.reviewer_note}
                                  </p>
                                )}
                              </div>
                              <div className="kyc-detail-images">
                                {v.selfie && (
                                  <a href={v.selfie} target="_blank" rel="noreferrer">
                                    <img src={v.selfie} alt="Selfie" className="kyc-detail-thumb" />
                                  </a>
                                )}
                                {v.id_document && (
                                  <a href={v.id_document} target="_blank" rel="noreferrer">
                                    <img src={v.id_document} alt="ID document" className="kyc-detail-thumb" />
                                  </a>
                                )}
                              </div>
                              <ul className="crypto-ops-log">
                                {v.logs.map((log, i) => (
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
