import { useEffect, useState } from 'react'
import { fetchUserDetail } from '../api/adminApi'
import { ApiError } from '../api/client'
import type { AdminUser } from '../api/types'
import { formatNgn, timeAgo } from '../utils/format'
import { StatusBadge } from './Badges'
import { IconBadgeCheck, IconCalendar, IconMail, IconPhone, IconWallet } from './Icons'
import { Modal } from './Modal'
import { UserAvatar } from './UserAvatar'

interface UserDetailModalProps {
  userId: number
  initial?: AdminUser
  onClose: () => void
}

export function UserDetailModal({ userId, initial, onClose }: UserDetailModalProps) {
  const [user, setUser] = useState<AdminUser | null>(initial ?? null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!initial)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchUserDetail(userId)
      .then((data) => {
        if (!cancelled) setUser(data)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : 'Failed to load user details.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  return (
    <Modal title="User details" onClose={onClose}>
      {error ? (
        <p className="login-error">{error}</p>
      ) : !user ? (
        <p className="cell-muted">{loading ? 'Loading…' : 'User not found.'}</p>
      ) : (
        <div className="user-detail">
          <div className="user-detail-head">
            <UserAvatar name={user.name} src={user.profile_picture} size={64} />
            <div className="user-detail-head-meta">
              <h4>{user.name}</h4>
              <span className="user-email">{user.email}</span>
            </div>
            <StatusBadge status={user.status} />
          </div>

          <div className="user-detail-rows">
            <div className="user-detail-row">
              <span className="user-detail-icon">
                <IconMail />
              </span>
              <div>
                <span className="user-detail-label">Email</span>
                <span className="user-detail-value">{user.email}</span>
              </div>
            </div>
            <div className="user-detail-row">
              <span className="user-detail-icon">
                <IconPhone />
              </span>
              <div>
                <span className="user-detail-label">Phone</span>
                <span className="user-detail-value">{user.phone || 'Not provided'}</span>
              </div>
            </div>
            <div className="user-detail-row">
              <span className="user-detail-icon">
                <IconWallet />
              </span>
              <div>
                <span className="user-detail-label">Wallet balance</span>
                <span className="user-detail-value">{formatNgn(user.balance_ngn)}</span>
              </div>
            </div>
            <div className="user-detail-row">
              <span className="user-detail-icon">
                <IconBadgeCheck />
              </span>
              <div>
                <span className="user-detail-label">Verification</span>
                <span className="user-detail-value">
                  {user.is_verified ? 'Verified' : 'Not verified'}
                </span>
              </div>
            </div>
            <div className="user-detail-row">
              <span className="user-detail-icon">
                <IconCalendar />
              </span>
              <div>
                <span className="user-detail-label">Joined</span>
                <span className="user-detail-value">
                  {new Date(user.date_joined).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <div className="user-detail-row">
              <span className="user-detail-icon">
                <IconCalendar />
              </span>
              <div>
                <span className="user-detail-label">Last active</span>
                <span className="user-detail-value">{timeAgo(user.last_active)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
