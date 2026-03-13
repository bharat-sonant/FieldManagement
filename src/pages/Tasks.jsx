import Navbar from '../components/Navbar/Navbar'
import styles from './Dashboard.module.css'

const Tasks = () => {
  return (
    <div className={styles.dashboardPage}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.heading}>Tasks</h1>
        <p className={styles.sub}>Task assignment and management coming soon.</p>
      </div>
    </div>
  )
}

export default Tasks
