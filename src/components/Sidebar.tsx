import type { PageId } from '../data/mockData'
import {
  IconBadgeCheck,
  IconChatDots,
  IconCube,
  IconDatabase,
  IconGrid,
  IconReceipt,
  IconSettings,
  IconTag,
  IconWallet,
} from './Icons'

const nav: { id: PageId; label: string; icon: typeof IconGrid }[] = [
  { id: 'overview', label: 'Overview', icon: IconGrid },
  { id: 'users', label: 'Users', icon: IconCube },
  { id: 'transaction', label: 'Transaction', icon: IconDatabase },
  { id: 'crypto', label: 'Crypto Ops', icon: IconReceipt },
  { id: 'master', label: 'Master Account', icon: IconWallet },
  { id: 'kyc', label: 'KYC Review', icon: IconBadgeCheck },
  { id: 'cards', label: 'Virtual Cards', icon: IconWallet },
  { id: 'support', label: 'Support Chat', icon: IconChatDots },
  { id: 'fees', label: 'Fees', icon: IconTag },
  { id: 'settings', label: 'Settings', icon: IconSettings },
]

interface Props {
  active: PageId
  onNavigate: (page: PageId) => void
  onLogout?: () => void
  /** Unread user messages across all support chats. */
  supportUnread?: number
}

export function Sidebar({ active, onNavigate, onLogout, supportUnread = 0 }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo.png" alt="Crownex" className="logo-img" width={56} height={56} />
      </div>
      <nav className="sidebar-nav">
        {nav.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          const badge = item.id === 'support' ? supportUnread : 0
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon />
              <span>{item.label}</span>
              {badge > 0 && (
                <span key={badge} className="nav-badge">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>
      {onLogout && (
        <button type="button" className="sidebar-logout" onClick={onLogout}>
          Log out
        </button>
      )}
    </aside>
  )
}
