import { useNavigate } from 'react-router-dom'
import { LogOut, User, Mail, Phone, Hash } from 'lucide-react'
import FEBottomNav from '../../components/FE/FEBottomNav'
import styles from './FEProfile.module.css'

const FEProfile = () => {
  const navigate = useNavigate()
  const user     = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Profile</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.avatarBox}>
          <div className={styles.avatar}>{user.name?.[0]?.toUpperCase()}</div>
          <h2 className={styles.name}>{user.name}</h2>
          <span className={styles.role}>Field Executive</span>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoRow}>
            <Hash size={16} className={styles.infoIcon} />
            <div>
              <p className={styles.infoLabel}>Employee ID</p>
              <p className={styles.infoValue}>{user.employeeId}</p>
            </div>
          </div>
          <div className={styles.divider} />
          <div className={styles.infoRow}>
            <Mail size={16} className={styles.infoIcon} />
            <div>
              <p className={styles.infoLabel}>Email</p>
              <p className={styles.infoValue}>{user.email}</p>
            </div>
          </div>
          <div className={styles.divider} />
          <div className={styles.infoRow}>
            <Phone size={16} className={styles.infoIcon} />
            <div>
              <p className={styles.infoLabel}>Mobile</p>
              <p className={styles.infoValue}>{user.mobileNumber}</p>
            </div>
          </div>
        </div>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <FEBottomNav />
    </div>
  )
}

export default FEProfile
