import { useState, type FormEvent } from 'react'
import { IconEye, IconEyeOff, IconLock, IconMail } from '../components/Icons'

/** Sample hardcoded admin credentials (frontend only) */
export const DEMO_ADMIN = {
  email: 'admin@crownex.com',
  password: 'admin123',
}

interface Props {
  onLogin: (email: string) => void
}

export function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)

    // Simulate a short auth delay
    window.setTimeout(() => {
      const emailOk = email.trim().toLowerCase() === DEMO_ADMIN.email
      const passOk = password === DEMO_ADMIN.password

      if (!emailOk || !passOk) {
        setError('Invalid email or password. Use the demo credentials below.')
        setLoading(false)
        return
      }

      onLogin(email.trim().toLowerCase())
      setLoading(false)
    }, 700)
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

        <div className="login-demo">
          <p className="login-demo-title">Demo credentials</p>
          <div className="login-demo-row">
            <span>Email</span>
            <code>{DEMO_ADMIN.email}</code>
          </div>
          <div className="login-demo-row">
            <span>Password</span>
            <code>{DEMO_ADMIN.password}</code>
          </div>
          <button
            type="button"
            className="login-fill-btn"
            onClick={() => {
              setEmail(DEMO_ADMIN.email)
              setPassword(DEMO_ADMIN.password)
              setError(null)
            }}
            disabled={loading}
          >
            Fill demo details
          </button>
        </div>
      </div>
    </div>
  )
}
