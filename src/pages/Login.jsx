import { MapPin, Zap, CheckCircle, Leaf } from 'lucide-react'
import LoginForm from '../components/Login/LoginForm'
import styles from './Login.module.css'

const Login = () => {
  return (
    <div className={styles.loginPage}>

      {/* Left Panel */}
      <div className={styles.left}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <MapPin size={28} color="#6a85f1" />
          </div>
          <h1>Field Portal</h1>
        </div>

        <div className={styles.tagline}>
          <h2>Field Management System</h2>
          <p>Manage your field workers, tasks, and operations in real-time.</p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <MapPin size={22} color="#fff" />
          </div>
          <div>
            <h3>Live Location Tracking</h3>
            <p>Track all field workers in real-time on the map</p>
          </div>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <Zap size={22} color="#fff" />
          </div>
          <div>
            <h3>Instant Task Assignment</h3>
            <p>Assign and update tasks to workers instantly</p>
          </div>
        </div>

        <div className={styles.badges}>
          <div className={styles.badge}>
            <CheckCircle size={18} />
            Verified
          </div>
          <div className={styles.badge}>
            <Leaf size={18} />
            Efficient
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className={styles.right}>
        <LoginForm />
      </div>

    </div>
  )
}

export default Login
