import { useState, type FormEvent } from 'react'
import { changePassword, updateProfile } from '../api/adminApi'
import type { AdminInfo } from '../api/client'
import { ApiError, getStoredAuth, setStoredAuth } from '../api/client'
import { IconEye, IconEyeOff, IconLock, IconMail } from '../components/Icons'

interface Props {
  admin: AdminInfo | null
  onProfileUpdated: (admin: AdminInfo) => void
}

export function Settings({ admin, onProfileUpdated }: Props) {
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showEmailPassword, setShowEmailPassword] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [emailLoading, setEmailLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [emailMessage, setEmailMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null,
  )
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'ok' | 'err'
    text: string
  } | null>(null)

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault()
    setEmailMessage(null)

    if (!newEmail.trim()) {
      setEmailMessage({ type: 'err', text: 'Please enter a new email address.' })
      return
    }
    if (!emailPassword) {
      setEmailMessage({ type: 'err', text: 'Enter your current password to confirm.' })
      return
    }

    setEmailLoading(true)
    try {
      const result = await updateProfile({
        new_email: newEmail.trim(),
        current_password: emailPassword,
      })
      const stored = getStoredAuth()
      if (stored) {
        const updatedAdmin: AdminInfo = { ...stored.admin, email: result.email }
        setStoredAuth({ ...stored, admin: updatedAdmin })
        onProfileUpdated(updatedAdmin)
      }
      setNewEmail('')
      setEmailPassword('')
      setEmailMessage({ type: 'ok', text: 'Email updated successfully.' })
    } catch (err) {
      setEmailMessage({
        type: 'err',
        text: err instanceof ApiError ? err.message : 'Failed to update email.',
      })
    } finally {
      setEmailLoading(false)
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    setPasswordMessage(null)

    if (!currentPassword) {
      setPasswordMessage({ type: 'err', text: 'Enter your current password.' })
      return
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'err', text: 'New password must be at least 8 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'err', text: 'New password and confirmation do not match.' })
      return
    }

    setPasswordLoading(true)
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage({ type: 'ok', text: 'Password updated successfully.' })
    } catch (err) {
      setPasswordMessage({
        type: 'err',
        text: err instanceof ApiError ? err.message : 'Failed to update password.',
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="settings-page">
      <div className="page-intro">
        <h1>Profile settings</h1>
        <p>Update your admin email and password for this account.</p>
      </div>

      <div className="settings-profile-card card">
        <img
          src="/logo.png"
          alt="Admin"
          className="settings-avatar"
          width={64}
          height={64}
        />
        <div>
          <p className="settings-role">ADMIN</p>
          <p className="settings-current-email">{admin?.email ?? '—'}</p>
        </div>
      </div>

      <div className="settings-grid">
        <section className="card settings-panel">
          <div className="settings-panel-header">
            <span className="settings-icon settings-icon-blue">
              <IconMail />
            </span>
            <div>
              <h3>Change email</h3>
              <p>Update the email used to sign in as admin.</p>
            </div>
          </div>

          <form className="settings-form" onSubmit={handleEmailSubmit} noValidate>
            <label className="field-label" htmlFor="current-email">
              Current email
            </label>
            <div className="fee-input-row plain">
              <input id="current-email" type="email" value={admin?.email ?? ''} disabled readOnly />
            </div>

            <label className="field-label" htmlFor="new-email">
              New email
            </label>
            <div className="fee-input-row plain">
              <input
                id="new-email"
                type="email"
                placeholder="new@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                autoComplete="email"
                disabled={emailLoading}
              />
            </div>

            <label className="field-label" htmlFor="email-password">
              Current password
            </label>
            <div className="fee-input-row plain password-row">
              <input
                id="email-password"
                type={showEmailPassword ? 'text' : 'password'}
                placeholder="Confirm with your password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                autoComplete="current-password"
                disabled={emailLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowEmailPassword((v) => !v)}
                aria-label={showEmailPassword ? 'Hide password' : 'Show password'}
              >
                {showEmailPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>

            {emailMessage && (
              <p className={`settings-msg settings-msg-${emailMessage.type}`}>
                {emailMessage.text}
              </p>
            )}

            <button type="submit" className="settings-submit" disabled={emailLoading}>
              {emailLoading ? 'Updating…' : 'Update email'}
            </button>
          </form>
        </section>

        <section className="card settings-panel">
          <div className="settings-panel-header">
            <span className="settings-icon settings-icon-purple">
              <IconLock />
            </span>
            <div>
              <h3>Change password</h3>
              <p>Choose a strong password you have not used before.</p>
            </div>
          </div>

          <form className="settings-form" onSubmit={handlePasswordSubmit} noValidate>
            <label className="field-label" htmlFor="current-password">
              Current password
            </label>
            <div className="fee-input-row plain password-row">
              <input
                id="current-password"
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                disabled={passwordLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>

            <label className="field-label" htmlFor="new-password">
              New password
            </label>
            <div className="fee-input-row plain password-row">
              <input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                disabled={passwordLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>

            <label className="field-label" htmlFor="confirm-password">
              Confirm new password
            </label>
            <div className="fee-input-row plain password-row">
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={passwordLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>

            {passwordMessage && (
              <p className={`settings-msg settings-msg-${passwordMessage.type}`}>
                {passwordMessage.text}
              </p>
            )}

            <button type="submit" className="settings-submit" disabled={passwordLoading}>
              {passwordLoading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
