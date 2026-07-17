import type { TxStatus, TxType } from '../data/mockData'

export function TypeBadge({ type, variant = 'default' }: { type: TxType; variant?: 'default' | 'pink' }) {
  const className =
    type === 'Swap'
      ? variant === 'pink'
        ? 'badge badge-swap-pink'
        : 'badge badge-swap'
      : type === 'Deposit'
        ? 'badge badge-deposit'
        : 'badge badge-withdrawal'

  return <span className={className}>{type}</span>
}

export function StatusBadge({ status }: { status: TxStatus | 'Active' | 'Inactive' }) {
  const isOk = status === 'Completed' || status === 'Active'
  return (
    <span className={`badge status-badge ${isOk ? 'status-ok' : 'status-other'}`}>
      <span className="status-dot" />
      {status}
    </span>
  )
}

export function GenderBadge({ gender }: { gender: string }) {
  return (
    <span className="badge gender-badge">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="9" r="4.5" stroke="currentColor" strokeWidth="2" />
        <path d="M12 13.5v6M9.5 16.5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {gender}
    </span>
  )
}
