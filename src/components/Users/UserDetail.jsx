import { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { changeUserStatus } from '../../actions/Users/usersAction'
import { fetchAssignedTasks, updateTaskType } from '../../actions/TaskAssigned/taskAssignedAction'
import { setAlertMessage } from '../../utils/setAlertMessage'
import EditUserModal from './EditUserModal'
import ConfirmModal from './ConfirmModal'
import AssignTaskDrawer from '../TaskAssigned/AssignTaskDrawer'
import styles from './UserDetail.module.css'

const UserDetail = ({ user, loading: pageLoading, onStatusChange, onUserUpdate }) => {
  const [statusLoading,   setStatusLoading]   = useState(false)
  const [showEdit,        setShowEdit]        = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [showAssign,      setShowAssign]      = useState(false)
  const [assignedTasks,   setAssignedTasks]   = useState([])
  const [tasksLoading,    setTasksLoading]    = useState(true)
  const [editingTaskId,   setEditingTaskId]   = useState(null)
  const [typeUpdating,    setTypeUpdating]    = useState(false)

  useEffect(() => {
    if (!user) return
    fetchAssignedTasks({
      employeeId: user.employeeId,
      setLoading:  setTasksLoading,
      onSuccess:  (data) => setAssignedTasks(data),
      onError:    () => setAssignedTasks([]),
    })
  }, [user?.employeeId])

  if (!user) {
    return <div className={styles.empty}>{!pageLoading && <p>Select a user to view details</p>}</div>
  }

  const isActive = user.status === 'ACTIVE'

  const handleTypeChange = (task, newType) => {
    if (newType === task.taskType) { setEditingTaskId(null); return }
    updateTaskType({
      id: task.id,
      taskType: newType,
      setLoading: setTypeUpdating,
      onSuccess: () => {
        setAssignedTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, taskType: newType } : t))
        setEditingTaskId(null)
        setAlertMessage('success', `Task type changed to ${newType === 'OTHER' ? 'Other' : 'KPI'}`)
      },
      onError: (msg) => { setEditingTaskId(null); setAlertMessage('error', msg) },
    })
  }

  const handleConfirm = () => {
    changeUserStatus(
      user.employeeId,
      user.status,
      setStatusLoading,
      (updated) => { setShowConfirm(false); onStatusChange(updated) },
      (msg) => { setShowConfirm(false); setAlertMessage('error', msg) },
    )
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
          {isActive && (
            <button className={styles.assignTaskBtn} onClick={() => setShowAssign(true)}>
              Assign Task
            </button>
          )}
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

      <div className={styles.taskSection}>
        <p className={styles.taskSectionLabel}>Assigned Tasks</p>
        {tasksLoading ? (
          <p className={styles.taskEmpty}>Loading...</p>
        ) : assignedTasks.length === 0 ? (
          <p className={styles.taskEmpty}>No tasks assigned yet</p>
        ) : (
          <div className={styles.taskList}>
            {assignedTasks.map((task, i) => (
              <div key={task.id} className={styles.taskRow}>
                <span className={styles.taskIndex}>{i + 1}</span>
                <span className={styles.taskTitle}>{task.title}</span>
                {editingTaskId === task.id ? (
                  <select
                    className={styles.typeSelect}
                    defaultValue={task.taskType || 'KPI'}
                    disabled={typeUpdating}
                    autoFocus
                    onChange={(e) => handleTypeChange(task, e.target.value)}
                    onBlur={() => setEditingTaskId(null)}
                  >
                    <option value="KPI">KPI</option>
                    <option value="OTHER">Other</option>
                  </select>
                ) : (
                  <>
                    <span className={task.taskType === 'OTHER' ? styles.badgeOther : styles.badgeKpi}>
                      {task.taskType === 'OTHER' ? 'Other' : 'KPI'}
                    </span>
                    <button className={styles.taskEditBtn} onClick={() => setEditingTaskId(task.id)} title="Change type">
                      <Pencil size={12} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
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

      {showAssign && (
        <AssignTaskDrawer
          user={user}
          onClose={() => setShowAssign(false)}
          onTaskAdd={(task) => setAssignedTasks((prev) => [...prev, task])}
          onTaskRemove={(id) => setAssignedTasks((prev) => prev.filter((t) => t.id !== id))}
        />
      )}
    </div>
  )
}

export default UserDetail
