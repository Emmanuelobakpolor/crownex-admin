import type { ReactNode } from 'react'
import type { PageId } from '../data/mockData'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface Props {
  active: PageId
  onNavigate: (page: PageId) => void
  showRateField?: boolean
  children: ReactNode
}

export function Layout({ active, onNavigate, showRateField, children }: Props) {
  return (
    <div className="app-shell">
      <Sidebar active={active} onNavigate={onNavigate} />
      <div className="main-column">
        <Header showRateField={showRateField} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}
