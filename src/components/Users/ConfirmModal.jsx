import { AlertTriangle } from 'lucide-react'
import styles from './ConfirmModal.module.css'

const ConfirmModal = ({ message, onConfirm, onCancel, loading }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconWrap}>
          <AlertTriangle size={28} color="#f59e0b" />
        </div>
        <h3 className={styles.title}>Are you sure?</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
