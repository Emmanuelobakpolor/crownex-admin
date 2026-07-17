import type { PageId } from '../data/mockData'
import { IconCube, IconDatabase, IconGrid, IconSettings, IconTag } from './Icons'

const nav: { id: PageId; label: string; icon: typeof IconGrid }[] = [
  { id: 'overview', label: 'Overview', icon: IconGrid },
  { id: 'users', label: 'Users', icon: IconCube },
  { id: 'transaction', label: 'Transaction', icon: IconDatabase },
  { id: 'fees', label: 'Fees', icon: IconTag },
  { id: 'settings', label: 'Settings', icon: IconSettings },
]

interface Props {
  active: PageId
  onNavigate: (page: PageId) => void
}

export function Sidebar({ active, onNavigate }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo.png" alt="Crownex" className="logo-img" width={56} height={56} />
      </div>
      <nav className="sidebar-nav">
        {nav.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
