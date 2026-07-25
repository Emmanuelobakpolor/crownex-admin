import { useEffect, useState } from 'react'
import { fetchCryptoFees, updateCryptoFee } from '../api/adminApi'
import { ApiError } from '../api/client'
import type { CryptoFeeSetting, CryptoFeeType } from '../api/types'
import { IconPercent } from '../components/Icons'

const FEE_LABELS: Record<CryptoFeeType, { title: string; desc: string }> = {
  buy: { title: 'Buy fee', desc: "Added on top of the crypto's NGN value." },
  sell: { title: 'Sell fee', desc: 'Deducted from the NGN payout.' },
  swap: {
    title: 'Swap fee',
    desc: 'Deducted from the notional before converting to the destination coin.',
  },
  withdraw: { title: 'Withdraw fee', desc: 'Deducted from the withdrawn amount, same coin.' },
}

interface Draft {
  flat_usd: string
  percent: string
}

type SaveMessage = { type: 'ok' | 'err'; text: string }

export function Fees() {
  const [fees, setFees] = useState<CryptoFeeSetting[]>([])
  const [drafts, setDrafts] = useState<Record<number, Draft>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Record<number, SaveMessage>>({})

  useEffect(() => {
    fetchCryptoFees()
      .then((rows) => {
        setFees(rows)
        setDrafts(
          Object.fromEntries(rows.map((row) => [row.id, { flat_usd: row.flat_usd, percent: row.percent }])),
        )
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load fees.')
      })
      .finally(() => setLoading(false))
  }, [])

  function updateDraft(id: number, field: keyof Draft, value: string) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  async function handleSave(row: CryptoFeeSetting) {
    const draft = drafts[row.id]
    setSavingId(row.id)
    setMessages((prev) => {
      const next = { ...prev }
      delete next[row.id]
      return next
    })

    try {
      const updated = await updateCryptoFee(row.id, {
        flat_usd: draft.flat_usd,
        percent: draft.percent,
      })
      setFees((prev) => prev.map((f) => (f.id === row.id ? updated : f)))
      setMessages((prev) => ({ ...prev, [row.id]: { type: 'ok', text: 'Saved.' } }))
    } catch (err) {
      setMessages((prev) => ({
        ...prev,
        [row.id]: { type: 'err', text: err instanceof ApiError ? err.message : 'Failed to save.' },
      }))
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return (
      <div className="fees-page">
        <p className="cell-muted">Loading fees…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fees-page">
        <p className="login-error">{error}</p>
      </div>
    )
  }

  return (
    <div className="fees-page">
      <div className="page-intro fees-intro">
        <h1>Crypto fees</h1>
        <p>
          Configure platform fees for buy, sell, swap and withdraw. Changes apply to the next
          quote a user requests — quotes already in flight keep their locked fee.
        </p>
      </div>

      <div className="fees-grid">
        {fees.map((row) => {
          const draft = drafts[row.id] ?? { flat_usd: row.flat_usd, percent: row.percent }
          const label = FEE_LABELS[row.fee_type]
          const message = messages[row.id]

          return (
            <section className="card fee-panel" key={row.id}>
              <div className="fee-panel-header">
                <h3>{label.title}</h3>
              </div>
              <div className="fee-inner-card">
                <div className="fee-inner-top">
                  <span className="fee-pct-icon">
                    <IconPercent />
                  </span>
                  <div>
                    <p className="fee-title">{label.title}</p>
                    <p className="fee-desc">{label.desc}</p>
                  </div>
                </div>

                <label className="field-label" htmlFor={`flat-${row.id}`}>
                  Flat fee (USD)
                </label>
                <div className="fee-input-row plain">
                  <input
                    id={`flat-${row.id}`}
                    type="text"
                    inputMode="decimal"
                    value={draft.flat_usd}
                    onChange={(e) => updateDraft(row.id, 'flat_usd', e.target.value)}
                  />
                </div>

                <label className="field-label" htmlFor={`pct-${row.id}`}>
                  Percentage
                </label>
                <div className="fee-input-row">
                  <input
                    id={`pct-${row.id}`}
                    type="text"
                    inputMode="decimal"
                    value={draft.percent}
                    onChange={(e) => updateDraft(row.id, 'percent', e.target.value)}
                  />
                  <span className="fee-suffix">%</span>
                </div>
              </div>

              {message && (
                <p className={`settings-msg settings-msg-${message.type}`}>{message.text}</p>
              )}

              <button
                type="button"
                className="settings-submit"
                disabled={savingId === row.id}
                onClick={() => handleSave(row)}
              >
                {savingId === row.id ? 'Saving…' : 'Save changes'}
              </button>
            </section>
          )
        })}
      </div>
    </div>
  )
}
