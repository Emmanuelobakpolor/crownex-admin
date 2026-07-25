import { useState, type FormEvent } from 'react'
import { login } from '../api/adminApi'
import type { AdminInfo } from '../api/client'
import { ApiError } from '../api/client'
import { IconEye, IconEyeOff, IconLock, IconMail } from '../components/Icons'

interface Props {
  onLogin: (admin: AdminInfo) => void
}

export function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    try {
      const admin = await login(email.trim(), password)
      onLogin(admin)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-grid" />
      </div>

      <div className="login-card">
        <div className="login-brand">
          <img src="/logo.png" alt="Crownex" className="login-logo" width={56} height={56} />
          <div>
            <h1>Welcome back</h1>
            <p>Sign in to the Crownex admin dashboard</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="field-label" htmlFor="login-email">
            Email
          </label>
          <div className="login-input-row">
            <IconMail className="login-input-icon" />
            <input
              id="login-email"
              type="email"
              placeholder="admin@crownex.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <label className="field-label" htmlFor="login-password">
            Password
          </label>
          <div className="login-input-row">
            <IconLock className="login-input-icon" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? (
              <span className="login-submit-loading">
                <span className="login-spinner" />
                Signing in…
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
