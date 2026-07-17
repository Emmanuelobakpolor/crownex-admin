import {
  IconChevronDown,
  IconFemale,
  IconMale,
  IconReceipt,
  IconUsersCircle,
} from '../components/Icons'
import { TransactionTable } from '../components/TransactionTable'
import { recentTransactions } from '../data/mockData'

interface Props {
  onViewAllTransactions?: () => void
}

export function Overview({ onViewAllTransactions }: Props) {
  return (
    <div className="overview-page">
      <div className="stat-row">
        <article className="card stat-card">
          <div className="stat-top">
            <span className="stat-icon icon-green">
              <IconUsersCircle />
            </span>
            <div>
              <p className="stat-label">Total Users</p>
              <p className="stat-value">
                <span className="currency-n">N</span> 5 234
              </p>
            </div>
          </div>
          <div className="stat-footer">
            <button type="button" className="link-muted">
              View All &gt;
            </button>
            <span className="pct-up">↑ 10.0%</span>
          </div>
        </article>

        <article className="card stat-card">
          <div className="stat-top">
            <span className="stat-icon icon-teal">
              <IconMale />
            </span>
            <div>
              <p className="stat-label">Total Deposit Today</p>
              <p className="stat-value">
                <span className="currency-n">N</span> 2 215
              </p>
            </div>
          </div>
          <div className="stat-footer">
            <button type="button" className="link-muted">
              View All &gt;
            </button>
            <span className="pct-up">↑ 10.0%</span>
          </div>
        </article>

        <article className="card stat-card">
          <div className="stat-top">
            <span className="stat-icon icon-blue">
              <IconFemale />
            </span>
            <div>
              <p className="stat-label">NGN Deposit</p>
              <p className="stat-value">
                <span className="currency-n">N</span> 2 215
              </p>
            </div>
          </div>
          <div className="stat-footer">
            <button type="button" className="link-muted">
              View All &gt;
            </button>
            <span className="pct-up">↑ 10.0%</span>
          </div>
        </article>

        <article className="card stat-card">
          <div className="stat-top">
            <span className="stat-icon icon-amber">
              <IconReceipt />
            </span>
            <div>
              <p className="stat-label">Total Withdrawal</p>
              <p className="stat-value">
                <span className="currency-n">N</span> 1789
              </p>
            </div>
          </div>
          <div className="stat-footer">
            <button type="button" className="link-muted">
              View All &gt;
            </button>
            <button type="button" className="month-select">
              Month <IconChevronDown />
            </button>
          </div>
        </article>
      </div>

      <div className="amount-row">
        <article className="card amount-card">
          <p className="amount-label">Total Swapped Cryptpo</p>
          <p className="amount-value">
            200,500.00 <span className="amount-unit">$</span>
          </p>
        </article>
        <article className="card amount-card">
          <p className="amount-label">Total Crypto Withdrawals</p>
          <p className="amount-value">
            100,500.00 <span className="amount-unit">USD</span>
          </p>
        </article>
      </div>

      <TransactionTable
        rows={recentTransactions}
        title="Recent Transactions"
        viewAllColor="green"
        onViewAll={onViewAllTransactions}
      />
    </div>
  )
}
