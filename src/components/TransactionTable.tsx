import type { Transaction } from '../data/mockData'
import { StatusBadge, TypeBadge } from './Badges'

interface Props {
  rows: Transaction[]
  typeVariant?: 'default' | 'pink'
  title?: string
  viewAllColor?: 'green' | 'purple'
  onViewAll?: () => void
}

export function TransactionTable({
  rows,
  typeVariant = 'default',
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
              <th>ID</th>
              <th>Type</th>
              <th>User</th>
              <th>Asset</th>
              <th>Amount</th>
              <th>Fee</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${row.id}-${row.type}-${i}`}>
                <td className="cell-muted">{row.id}</td>
                <td>
                  <TypeBadge type={row.type} variant={typeVariant} />
                </td>
                <td>{row.user}</td>
                <td className="cell-asset">{row.asset}</td>
                <td>{row.amount}</td>
                <td>{row.fee}</td>
                <td>
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
