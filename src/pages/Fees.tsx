import { useState } from 'react'
import { IconClose, IconPercent } from '../components/Icons'

export function Fees() {
  const [swapFee, setSwapFee] = useState('10')
  const [depositFlat, setDepositFlat] = useState('10')
  const [depositPct, setDepositPct] = useState('1')
  const [withdrawFlat, setWithdrawFlat] = useState('10')
  const [withdrawPct, setWithdrawPct] = useState('1')

  return (
    <div className="fees-page">
      <div className="page-intro fees-intro">
        <h1>App fees</h1>
        <p>Configure platform fees for swaps, deposits and withdrawals.</p>
      </div>

      <div className="fees-grid">
        <section className="card fee-panel">
          <div className="fee-panel-header">
            <h3>Swap fee</h3>
            <button type="button" className="fee-close" aria-label="Close">
              <IconClose />
            </button>
          </div>
          <div className="fee-inner-card">
            <div className="fee-inner-top">
              <span className="fee-pct-icon">
                <IconPercent />
              </span>
              <div>
                <p className="fee-title">Swap Fee</p>
                <p className="fee-desc">Charged per swap on notional value</p>
              </div>
            </div>
            <div className="fee-input-row">
              <input
                type="text"
                value={swapFee}
                onChange={(e) => setSwapFee(e.target.value)}
                aria-label="Swap fee percent"
              />
              <span className="fee-suffix">%</span>
            </div>
          </div>
          <button type="button" className="add-charge-btn" disabled>
            Add Withdrawal Charge
          </button>
        </section>

        <section className="card fee-panel">
          <div className="fee-panel-header">
            <h3>Deposit fee</h3>
            <button type="button" className="fee-close" aria-label="Close">
              <IconClose />
            </button>
          </div>
          <div className="fee-inner-card">
            <div className="fee-inner-top">
              <span className="fee-pct-icon">
                <IconPercent />
              </span>
              <div>
                <p className="fee-title">Deposit fee</p>
                <p className="fee-desc">Flat Network fee plus a percentage.</p>
              </div>
            </div>
            <label className="field-label">Flat (USD)</label>
            <div className="fee-input-row plain">
              <input
                type="text"
                value={depositFlat}
                onChange={(e) => setDepositFlat(e.target.value)}
                aria-label="Deposit flat fee USD"
              />
            </div>
            <label className="field-label">Flat (USD)</label>
            <div className="fee-input-row">
              <input
                type="text"
                value={depositPct}
                onChange={(e) => setDepositPct(e.target.value)}
                aria-label="Deposit fee percent"
              />
              <span className="fee-suffix">%</span>
            </div>
          </div>
          <button type="button" className="add-charge-btn" disabled>
            Add Withdrawal Charge
          </button>
        </section>

        <section className="card fee-panel fee-panel-wide">
          <div className="fee-panel-header">
            <h3>Withdrawal fee</h3>
            <button type="button" className="fee-close" aria-label="Close">
              <IconClose />
            </button>
          </div>
          <div className="fee-inner-card">
            <div className="fee-inner-top">
              <span className="fee-pct-icon">
                <IconPercent />
              </span>
              <div>
                <p className="fee-title">Withdrawal fee</p>
                <p className="fee-desc">Flat Network fee plus a percentage.</p>
              </div>
            </div>
            <label className="field-label">Flat (USD)</label>
            <div className="fee-input-row plain">
              <input
                type="text"
                value={withdrawFlat}
                onChange={(e) => setWithdrawFlat(e.target.value)}
                aria-label="Withdrawal flat fee USD"
              />
            </div>
            <label className="field-label">Flat (USD)</label>
            <div className="fee-input-row">
              <input
                type="text"
                value={withdrawPct}
                onChange={(e) => setWithdrawPct(e.target.value)}
                aria-label="Withdrawal fee percent"
              />
              <span className="fee-suffix">%</span>
            </div>
          </div>
          <button type="button" className="add-charge-btn" disabled>
            Add Withdrawal Charge
          </button>
        </section>
      </div>
    </div>
  )
}
