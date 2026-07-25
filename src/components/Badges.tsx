import type { TransactionCategory } from '../api/types'

const TYPE_LABELS: Record<TransactionCategory, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  airtime: 'Airtime',
  data: 'Data',
  cable: 'Cable TV',
  electricity: 'Electricity',
  giftcard: 'Gift Card',
}

const TYPE_CLASSES: Record<TransactionCategory, string> = {
  deposit: 'badge-deposit',
  withdrawal: 'badge-withdrawal',
  airtime: 'badge-swap',
  data: 'badge-swap',
  cable: 'badge-swap',
  electricity: 'badge-swap',
  giftcard: 'badge-swap-pink',
}

export function TypeBadge({ type }: { type: TransactionCategory }) {
  const className = TYPE_CLASSES[type] ?? 'badge-swap'
  return <span className={`badge ${className}`}>{TYPE_LABELS[type] ?? type}</span>
}

const OK_STATUSES = new Set(['completed', 'success', 'active'])

export function StatusBadge({ status }: { status: string }) {
  const isOk = OK_STATUSES.has(status.toLowerCase())
  const label = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  return (
    <span className={`badge status-badge ${isOk ? 'status-ok' : 'status-other'}`}>
      <span className="status-dot" />
      {label}
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
