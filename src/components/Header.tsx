import { IconBell, IconChevronLeft, IconSearch } from './Icons'

interface Props {
  showRateField?: boolean
  adminEmail?: string
}

export function Header({ showRateField = false, adminEmail = 'letszz@gmail.com' }: Props) {
  return (
    <header className="top-header">
      <div className="header-left">
        <button type="button" className="icon-circle" aria-label="Back">
          <IconChevronLeft />
        </button>
        <div className="search-box">
          <IconSearch className="search-icon" />
          <input type="search" placeholder="Search" aria-label="Search" />
        </div>
      </div>

      {showRateField && (
        <div className="rate-field">
          <span className="rate-value">5</span>
          <span className="rate-unit">coins/msg</span>
        </div>
      )}

      <div className="header-right">
        <button type="button" className="bell-btn" aria-label="Notifications">
          <IconBell />
          <span className="bell-dot" />
        </button>
        <div className="admin-profile">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Admin"
            className="admin-avatar"
            width={36}
            height={36}
          />
          <div className="admin-meta">
            <span className="admin-label">ADMIN</span>
            <span className="admin-email">{adminEmail}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
