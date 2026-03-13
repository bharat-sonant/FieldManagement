import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { MapPin, LayoutDashboard, Users, ClipboardList, Navigation, Menu, X } from 'lucide-react'
import styles from './Navbar.module.css'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Users',     path: '/users',     icon: <Users size={18} /> },
  { label: 'Tasks',     path: '/tasks',     icon: <ClipboardList size={18} /> },
  { label: 'Tracking',  path: '/tracking',  icon: <Navigation size={18} /> },
]

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className={styles.navbar}>
        {/* Logo */}
        <NavLink to="/dashboard" className={styles.logo}>
          <div className={styles.logoIcon}>
            <MapPin size={18} color="#fff" />
          </div>
          <span className={styles.logoText}>Field Portal</span>
        </NavLink>

        {/* Desktop Nav */}
        <ul className={styles.navLinks}>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => isActive ? styles.active : ''}
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right */}
        <div className={styles.navRight}>
          <button className={styles.avatarBtn}>A</button>
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => isActive ? styles.active : ''}
              onClick={() => setMenuOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  )
}

export default Navbar
