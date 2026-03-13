import Navbar from '../components/Navbar/Navbar'
import styles from './Dashboard.module.css'

const Dashboard = () => {
  return (
    <div className={styles.dashboardPage}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.heading}>Dashboard</h1>
        <p className={styles.sub}>Welcome to Field Management System</p>
      </div>
    </div>
  )
}

export default Dashboard
