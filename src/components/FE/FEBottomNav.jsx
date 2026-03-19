import { NavLink } from 'react-router-dom'
import { Home, User } from 'lucide-react'
import styles from './FEBottomNav.module.css'

const FEBottomNav = () => {
  return (
    <nav className={styles.nav}>
      <NavLink to="/fe/home" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
        <Home size={22} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/fe/profile" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
        <User size={22} />
        <span>Profile</span>
      </NavLink>
    </nav>
  )
}

export default FEBottomNav
