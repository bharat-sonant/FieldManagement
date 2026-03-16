import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { changeUserStatus } from '../../actions/Users/usersAction'
import EditUserModal from './EditUserModal'
import ConfirmModal from './ConfirmModal'
import styles from './UserDetail.module.css'

const UserDetail = ({ user, onStatusChange, onUserUpdate }) => {
  const [statusLoading, setStatusLoading] = useState(false)
  const [showEdit, setShowEdit]           = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)

  if (!user) {
    return (
      <div className={styles.empty}>
        <p>Select a user to view details</p>
      </div>
    )
  }

  const isActive = user.status === 'ACTIVE'

  const handleConfirm = () => {
    changeUserStatus(user.employeeId, user.status, setStatusLoading, (updated) => {
      setShowConfirm(false)
      onStatusChange(updated)
    })
  }

  return (
    <div className={styles.detail}>
      <div className={styles.header}>
        <div className={styles.avatar}>{user.name.charAt(0)}</div>
        <div className={styles.info}>
          <h2 className={styles.name}>{user.name}</h2>
          <p className={styles.meta}>{user.employeeId} · {user.email}</p>
        </div>
        <div className={styles.actions}>
          <button
            className={isActive ? styles.deactivateBtn : styles.activateBtn}
            onClick={() => setShowConfirm(true)}
          >
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button className={styles.editBtn} onClick={() => setShowEdit(true)}>
            <Pencil size={15} />
          </button>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          message={`Do you want to ${isActive ? 'deactivate' : 'activate'} ${user.name}?`}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
          loading={statusLoading}
        />
      )}

      {showEdit && (
        <EditUserModal
          user={user}
          onClose={() => setShowEdit(false)}
          onSuccess={(_, form) => onUserUpdate({ ...user, name: form.name, email: form.email, mobileNumber: form.mobile })}
        />
      )}
    </div>
  )
}

export default UserDetail
