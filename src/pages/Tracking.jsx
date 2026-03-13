import Navbar from '../components/Navbar/Navbar'
import styles from './Dashboard.module.css'

const Tracking = () => {
  return (
    <div className={styles.dashboardPage}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.heading}>Tracking</h1>
        <p className={styles.sub}>Live location tracking of field workers coming soon.</p>
      </div>
    </div>
  )
}

export default Tracking
