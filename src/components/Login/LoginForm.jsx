import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { loginUser } from '../../actions/Login/loginAction'
import styles from './LoginForm.module.css'

const LoginForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData]         = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe]     = useState(false)
  const [loading, setLoading]           = useState(false)
  const [errors, setErrors]             = useState({})

  useEffect(() => {
    const savedEmail    = localStorage.getItem('rememberedEmail')
    const savedPassword = localStorage.getItem('rememberedPassword')
    if (savedEmail && savedPassword) {
      setFormData({ email: savedEmail, password: savedPassword })
      setRememberMe(true)
    }
  }, [])

  const validate = (data) => {
    const errs = {}
    if (!data.email.trim())    errs.email    = 'Email is required'
    if (!data.password.trim()) errs.password = 'Password is required'
    return errs
  }

  const handleChange = (e) => {
    const updated = { ...formData, [e.target.name]: e.target.value }
    setFormData(updated)
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate(formData)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    if (rememberMe) {
      localStorage.setItem('rememberedEmail',    formData.email)
      localStorage.setItem('rememberedPassword', formData.password)
    } else {
      localStorage.removeItem('rememberedEmail')
      localStorage.removeItem('rememberedPassword')
    }

    loginUser(
      formData,
      setLoading,
      (userData) => {
        localStorage.setItem('user', JSON.stringify(userData))
        navigate('/dashboard')
      },
      (msg) => setErrors({ api: msg })
    )
  }

  return (
    <div className={styles.card}>
      <h2>Welcome Back!</h2>
      <p className={styles.subtitle}>Please login to continue to your account</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.formGroup}>
          <label>Email Address</label>
          <div className={`${styles.inputWrapper} ${errors.email ? styles.inputError : ''}`}>
            <Mail className={styles.inputIcon} size={18} />
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Password</label>
          <div className={`${styles.inputWrapper} ${errors.password ? styles.inputError : ''}`}>
            <Lock className={styles.inputIcon} size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className={styles.errorMsg}>{errors.password}</span>}
          {errors.api     && <span className={styles.errorMsg}>{errors.api}</span>}
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

        <button type="submit" className={styles.loginBtn} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  )
}

export default LoginForm
