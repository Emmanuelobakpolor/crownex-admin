import type { ReactNode } from 'react'
import type { PageId } from '../data/mockData'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface Props {
  active: PageId
  onNavigate: (page: PageId) => void
  showRateField?: boolean
  adminEmail?: string
  onLogout?: () => void
  children: ReactNode
}

export function Layout({
  active,
  onNavigate,
  showRateField,
  adminEmail,
  onLogout,
  children,
}: Props) {
  return (
    <div className="app-shell">
      <Sidebar active={active} onNavigate={onNavigate} onLogout={onLogout} />
      <div className="main-column">
        <Header showRateField={showRateField} adminEmail={adminEmail} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}
