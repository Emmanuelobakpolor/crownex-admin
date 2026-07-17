import { useMemo, useState } from 'react'
import { IconChat } from '../components/Icons'
import { TransactionTable } from '../components/TransactionTable'
import { recentTransactions, type TxType } from '../data/mockData'

type Filter = 'all' | TxType

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Type' },
  { id: 'Swap', label: 'Swaps' },
  { id: 'Deposit', label: 'Deposits' },
  { id: 'Withdrawal', label: 'Withdrawals' },
]

export function Transactions() {
  const [filter, setFilter] = useState<Filter>('all')

  const rows = useMemo(() => {
    if (filter === 'all') return recentTransactions
    return recentTransactions.filter((t) => t.type === filter)
  }, [filter])

  return (
    <div className="transactions-page">
      <div className="page-intro">
        <h1>Transactions</h1>
        <p>All swaps,deposits and withdrawals across the platform</p>
      </div>

      <div className="tx-summary-row">
        <article className="card tx-summary-card">
          <span className="tx-summary-icon">
            <IconChat />
          </span>
          <div>
            <p className="tx-summary-label">Swaps</p>
            <p className="tx-summary-count">5</p>
            <p className="tx-summary-amount">$243,8484.00</p>
          </div>
        </article>
        <article className="card tx-summary-card">
          <span className="tx-summary-icon">
            <IconChat />
          </span>
          <div>
            <p className="tx-summary-label">Deposit</p>
            <p className="tx-summary-count">5</p>
            <p className="tx-summary-amount">$243,8484.00</p>
          </div>
        </article>
        <article className="card tx-summary-card">
          <span className="tx-summary-icon">
            <IconChat />
          </span>
          <div>
            <p className="tx-summary-label">Withdrawals</p>
            <p className="tx-summary-count">5</p>
            <p className="tx-summary-amount">$243,8484.00</p>
          </div>
        </article>
      </div>

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

      <TransactionTable
        rows={rows}
        typeVariant="pink"
        title="Transaction log"
        viewAllColor="purple"
      />
    </div>
  )
}
