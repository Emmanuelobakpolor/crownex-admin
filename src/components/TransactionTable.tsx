import type { AdminTransaction } from '../api/types'
import { formatNgn } from '../utils/format'
import { StatusBadge, TypeBadge } from './Badges'

interface Props {
  rows: AdminTransaction[]
  title?: string
  viewAllColor?: 'green' | 'purple'
  onViewAll?: () => void
}

export function TransactionTable({
  rows,
  title = 'Recent Transactions',
  viewAllColor = 'green',
  onViewAll,
}: Props) {
  return (
    <section className="card table-card">
      <div className="table-card-header">
        <h3>{title}</h3>
        <button type="button" className={`link-btn link-${viewAllColor}`} onClick={onViewAll}>
          View all &gt;
        </button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Type</th>
              <th>User</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="cell-muted">
                  No transactions yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="cell-muted">{row.reference}</td>
                  <td>
                    <TypeBadge type={row.type} />
                  </td>
                  <td>{row.user_name}</td>
                  <td className="cell-asset">{row.description}</td>
                  <td>{formatNgn(row.amount)}</td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
