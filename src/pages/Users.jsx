import Navbar from '../components/Navbar/Navbar'
import styles from './Dashboard.module.css'

const Users = () => {
  return (
    <div className={styles.dashboardPage}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.heading}>Users</h1>
        <p className={styles.sub}>Field workers and user management coming soon.</p>
      </div>
    </div>
  )
}

export default Users
