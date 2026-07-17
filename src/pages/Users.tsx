import { GenderBadge, StatusBadge } from '../components/Badges'
import { users } from '../data/mockData'

export function Users() {
  return (
    <div className="users-page">
      <div className="users-count-bar">
        <p>
          Number of Users: <strong>1200</strong>
        </p>
      </div>

      <section className="card table-card users-table-card">
        <div className="table-wrap">
          <table className="data-table users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={`${user.email}-${i}`}>
                  <td>
                    <div className="user-cell">
                      <span className="user-name">{user.name}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                  </td>
                  <td>
                    {user.gender ? (
                      <GenderBadge gender={user.gender} />
                    ) : (
                      user.balance
                    )}
                  </td>
                  <td>
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="cell-muted">{user.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
