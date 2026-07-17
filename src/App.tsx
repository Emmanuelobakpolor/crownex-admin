import { useEffect, useState } from 'react'
import { Layout } from './components/Layout'
import type { PageId } from './data/mockData'
import { Fees } from './pages/Fees'
import { Login } from './pages/Login'
import { Overview } from './pages/Overview'
import { Preloader } from './pages/Preloader'
import { Settings } from './pages/Settings'
import { Transactions } from './pages/Transactions'
import { Users } from './pages/Users'
import './App.css'

const AUTH_KEY = 'crownex_admin_auth'
const PRELOADER_MS = 2400

function App() {
  const [phase, setPhase] = useState<'preloader' | 'login' | 'app'>('preloader')
  const [preloaderVisible, setPreloaderVisible] = useState(true)
  const [page, setPage] = useState<PageId>('overview')
  const [adminEmail, setAdminEmail] = useState('admin@crownex.com')

  useEffect(() => {
    const hideTimer = window.setTimeout(() => {
      setPreloaderVisible(false)
    }, PRELOADER_MS)

    const nextTimer = window.setTimeout(() => {
      const saved = sessionStorage.getItem(AUTH_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as { email?: string }
          if (parsed.email) setAdminEmail(parsed.email)
        } catch {
          /* ignore */
        }
        setPhase('app')
      } else {
        setPhase('login')
      }
    }, PRELOADER_MS + 450)

    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(nextTimer)
    }
  }, [])

  function handleLogin(email: string) {
    setAdminEmail(email)
    sessionStorage.setItem(AUTH_KEY, JSON.stringify({ email }))
    setPhase('app')
  }

  function handleLogout() {
    sessionStorage.removeItem(AUTH_KEY)
    setPage('overview')
    setPhase('login')
  }

  const showRateField = page === 'transaction' || page === 'fees'

  if (phase === 'preloader') {
    return <Preloader visible={preloaderVisible} />
  }

  if (phase === 'login') {
    return (
      <>
        {!preloaderVisible ? null : <Preloader visible={false} />}
        <Login onLogin={handleLogin} />
      </>
    )
  }

  return (
    <Layout
      active={page}
      onNavigate={setPage}
      showRateField={showRateField}
      adminEmail={adminEmail}
      onLogout={handleLogout}
    >
      {page === 'overview' && (
        <Overview onViewAllTransactions={() => setPage('transaction')} />
      )}
      {page === 'users' && <Users />}
      {page === 'transaction' && <Transactions />}
      {page === 'fees' && <Fees />}
      {page === 'settings' && <Settings />}
    </Layout>
  )
}

export default App
