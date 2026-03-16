import { useState } from 'react'
import { Search, X } from 'lucide-react'
import styles from './UsersSidebar.module.css'

const UsersSidebar = ({ users, selectedUser, onSelect, filter, onFilterChange, loading }) => {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name))

  const filteredBySearch = searchQuery.trim()
    ? sortedUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedUsers

  return (
    <div className={styles.sidebar}>
      <div className={styles.topBar}>
        {searchOpen ? (
          <div className={styles.searchInputWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              autoFocus
              className={styles.searchInput}
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className={styles.closeSearch} onClick={() => { setSearchOpen(false); setSearchQuery('') }}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <select
              className={styles.filterSelect}
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <button className={styles.searchBtn} onClick={() => setSearchOpen(true)}>
              <Search size={16} />
            </button>
          </>
        )}
      </div>

      <ul className={styles.userList}>
        {loading && <li className={styles.empty}>Loading...</li>}

        {!loading && filteredBySearch.length === 0 && (
          <li className={styles.empty}>No users found</li>
        )}

        {!loading && filteredBySearch.map((user) => (
          <li
            key={user.employeeId}
            className={`${styles.userItem} ${selectedUser?.employeeId === user.employeeId ? styles.selected : ''}`}
            onClick={() => onSelect(user)}
          >
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.empBadge}>{user.employeeId}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UsersSidebar
