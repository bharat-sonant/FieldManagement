import { X, User, Mail, Hash, Phone, Pencil } from 'lucide-react'
import { useState } from 'react'
import { updateUser } from '../../actions/Users/usersAction'
import styles from './EditUserModal.module.css'

const validate = (form) => {
  const errors = {}
  if (!form.name.trim())                                              errors.name   = 'Name is required'
  if (!form.email.trim())                                             errors.email  = 'Email is required'
  else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(form.email))       errors.email  = 'Only @gmail.com email is accepted'
  if (!form.mobile.trim())                                            errors.mobile = 'Mobile number is required'
  else if (!/^\d{10}$/.test(form.mobile))                             errors.mobile = 'Enter a valid 10-digit number'
  return errors
}

const EditUserModal = ({ user, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    employeeId: user.employeeId,
    name:       user.name,
    email:      user.email,
    mobile:     user.mobileNumber || '',
  })
  const [errors, setErrors]   = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value }
    setForm(updated)
    if (touched[e.target.name]) setErrors(validate(updated))
  }

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true })
    setErrors(validate(form))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const allTouched = { name: true, email: true, mobile: true }
    setTouched(allTouched)
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setApiError('')
    updateUser(form, setLoading, (updated) => { onSuccess(updated, form); onClose() }, setApiError)
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalIcon}>
            <Pencil size={20} color="#fff" />
          </div>
          <div>
            <h2 className={styles.modalTitle}>Update User</h2>
            <p className={styles.modalSub}>Edit field executive details</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          <div className={styles.field}>
            <label>Employee ID</label>
            <div className={`${styles.inputWrap} ${styles.disabled}`}>
              <Hash size={15} className={styles.icon} />
              <input name="employeeId" value={form.employeeId} disabled />
            </div>
          </div>

          <div className={styles.field}>
            <label>Name</label>
            <div className={`${styles.inputWrap} ${errors.name && touched.name ? styles.inputError : ''}`}>
              <User size={15} className={styles.icon} />
              <input name="name" placeholder="Enter full name" value={form.name} onChange={handleChange} onBlur={handleBlur} />
            </div>
            {errors.name && touched.name && <span className={styles.error}>{errors.name}</span>}
          </div>

          <div className={styles.field}>
            <label>Email ID</label>
            <div className={`${styles.inputWrap} ${errors.email && touched.email ? styles.inputError : ''}`}>
              <Mail size={15} className={styles.icon} />
              <input name="email" type="email" placeholder="Enter email address" value={form.email} onChange={handleChange} onBlur={handleBlur} />
            </div>
            {errors.email && touched.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label>Mobile Number</label>
            <div className={`${styles.inputWrap} ${errors.mobile && touched.mobile ? styles.inputError : ''}`}>
              <Phone size={15} className={styles.icon} />
              <input name="mobile" placeholder="Enter 10-digit mobile number" value={form.mobile}
                onChange={(e) => { if (/^\d*$/.test(e.target.value)) handleChange(e) }}
                onBlur={handleBlur} maxLength={10} inputMode="numeric" />
            </div>
            {errors.mobile && touched.mobile && <span className={styles.error}>{errors.mobile}</span>}
          </div>

          {apiError && <span className={styles.error}>{apiError}</span>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            <Pencil size={15} />
            {loading ? 'Updating...' : 'Update User'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditUserModal
