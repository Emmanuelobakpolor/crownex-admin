import { useEffect, useState } from 'react'
import { logout as apiLogout } from './api/adminApi'
import type { AdminInfo } from './api/client'
import { clearStoredAuth, getStoredAuth } from './api/client'
import { Layout } from './components/Layout'
import type { PageId } from './data/mockData'
import { Cards } from './pages/Cards'
import { CryptoOps } from './pages/CryptoOps'
import { Fees } from './pages/Fees'
import { Kyc } from './pages/Kyc'
import { Login } from './pages/Login'
import { Overview } from './pages/Overview'
import { Preloader } from './pages/Preloader'
import { Settings } from './pages/Settings'
import { Transactions } from './pages/Transactions'
import { Users } from './pages/Users'
import './App.css'

const PRELOADER_MS = 2400

function App() {
  const [phase, setPhase] = useState<'preloader' | 'login' | 'app'>('preloader')
  const [preloaderVisible, setPreloaderVisible] = useState(true)
  const [page, setPage] = useState<PageId>('overview')
  const [admin, setAdmin] = useState<AdminInfo | null>(null)

  useEffect(() => {
    const hideTimer = window.setTimeout(() => {
      setPreloaderVisible(false)
    }, PRELOADER_MS)

    const nextTimer = window.setTimeout(() => {
      const stored = getStoredAuth()
      if (stored?.access) {
        setAdmin(stored.admin)
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

  function handleLogin(loggedInAdmin: AdminInfo) {
    setAdmin(loggedInAdmin)
    setPhase('app')
  }

  function handleLogout() {
    apiLogout().catch(() => {
      // Session is cleared locally regardless of whether the blacklist call succeeds.
    })
    clearStoredAuth()
    setAdmin(null)
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
      adminEmail={admin?.email ?? ''}
      onLogout={handleLogout}
    >
      {page === 'overview' && (
        <Overview
          onViewAllTransactions={() => setPage('transaction')}
          onViewAllUsers={() => setPage('users')}
        />
      )}
      {page === 'users' && <Users />}
      {page === 'transaction' && <Transactions />}
      {page === 'crypto' && <CryptoOps />}
      {page === 'kyc' && <Kyc />}
      {page === 'cards' && <Cards />}
      {page === 'fees' && <Fees />}
      {page === 'settings' && <Settings admin={admin} onProfileUpdated={setAdmin} />}
    </Layout>
  )
}

export default App
