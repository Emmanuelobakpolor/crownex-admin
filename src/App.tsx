import { useState } from 'react'
import { Layout } from './components/Layout'
import type { PageId } from './data/mockData'
import { Fees } from './pages/Fees'
import { Overview } from './pages/Overview'
import { Settings } from './pages/Settings'
import { Transactions } from './pages/Transactions'
import { Users } from './pages/Users'
import './App.css'

function App() {
  const [page, setPage] = useState<PageId>('overview')

  const showRateField = page === 'transaction' || page === 'fees'

  return (
    <Layout active={page} onNavigate={setPage} showRateField={showRateField}>
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
