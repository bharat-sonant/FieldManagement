import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import styles from './LoginForm.module.css'

const LoginForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div className={styles.card}>
      <h2>Welcome Back!</h2>
      <p className={styles.subtitle}>Please login to continue to your account</p>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Email Address</label>
          <div className={styles.inputWrapper}>
            <Mail className={styles.inputIcon} size={18} />
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Password</label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className={styles.formRow}>
          <label className={styles.rememberMe}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
          <a href="#" className={styles.forgotLink}>Forgot password?</a>
        </div>

        <button type="submit" className={styles.loginBtn}>
          Login
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  )
}

export default LoginForm
