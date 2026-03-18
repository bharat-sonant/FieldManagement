import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { fetchTasks } from '../../actions/Tasks/tasksAction'
import { fetchAssignedTasks, assignTask, unassignTask } from '../../actions/TaskAssigned/taskAssignedAction'
import { setAlertMessage } from '../../utils/setAlertMessage'
import ConfirmModal from '../Users/ConfirmModal'
import styles from './AssignTaskDrawer.module.css'

const AssignTaskDrawer = ({ user, onClose, onTaskAdd, onTaskRemove }) => {
  const [allTasks,      setAllTasks]      = useState([])
  const [assignedTasks, setAssignedTasks] = useState([])
  const [selectedTask,  setSelectedTask]  = useState('')
  const [taskType,      setTaskType]      = useState('KPI')
  const [loading,       setLoading]       = useState(false)
  const [addLoading,    setAddLoading]    = useState(false)
  const [removeId,      setRemoveId]      = useState(null)
  const [confirmTask,   setConfirmTask]   = useState(null)

  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    fetchTasks({
      setLoading: () => {},
      onSuccess:  (data) => setAllTasks(data),
      onError:    (msg)  => setAlertMessage('error', msg),
    })

    fetchAssignedTasks({
      employeeId: user.employeeId,
      setLoading,
      onSuccess:  (data) => setAssignedTasks(data),
      onError:    (msg)  => setAlertMessage('error', msg),
    })

    return () => { document.body.style.overflow = '' }
  }, [])

  const availableTasks = allTasks.filter(
    (t) => !assignedTasks.find((a) => a.taskId === t.id)
  )

  const handleAdd = () => {
    if (!selectedTask) return
    assignTask({
      employeeId: user.employeeId,
      taskId:     selectedTask,
      assignedBy: loggedInUser?.name || loggedInUser?.employeeId || 'Admin',
      taskType,
      setLoading: setAddLoading,
      onSuccess:  (data) => {
        const task = allTasks.find((t) => t.id === selectedTask)
        const newEntry = { ...data, taskId: selectedTask, title: task?.title, taskType }
        setAssignedTasks((prev) => [...prev, newEntry])
        setSelectedTask('')
        setAlertMessage('success', `Task assigned to ${user.name}`)
        if (onTaskAdd) onTaskAdd(newEntry)
      },
      onError: (msg) => setAlertMessage('error', msg),
    })
  }

  const handleRemove = (assignmentId) => {
    unassignTask({
      id:         assignmentId,
      setLoading: () => setRemoveId(assignmentId),
      onSuccess:  () => {
        setAssignedTasks((prev) => prev.filter((t) => t.id !== assignmentId))
        setRemoveId(null)
        setAlertMessage('success', 'Task removed successfully')
        if (onTaskRemove) onTaskRemove(assignmentId)
      },
      onError: (msg) => { setRemoveId(null); setAlertMessage('error', msg) },
    })
  }

  return (
    <>
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>

        <div className={styles.header}>
          <div className={styles.headerBar} />
          <h3 className={styles.title}>{user.name} – KPI Tasks</h3>
          <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        <div className={styles.body}>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>Select Tasks</p>
            <div className={styles.selectRow}>
              <select
                className={styles.select}
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                disabled={addLoading}
              >
                <option value="">Select Task</option>
                {availableTasks.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
              <button
                className={styles.addBtn}
                onClick={handleAdd}
                disabled={!selectedTask || addLoading}
              >
                <Plus size={18} />
              </button>
            </div>
            <div className={styles.typeToggle}>
              <button
                className={`${styles.typeBtn} ${taskType === 'KPI' ? styles.typeBtnKpi : ''}`}
                onClick={() => setTaskType('KPI')}
              >KPI</button>
              <button
                className={`${styles.typeBtn} ${taskType === 'OTHER' ? styles.typeBtnOther : ''}`}
                onClick={() => setTaskType('OTHER')}
              >Other</button>
            </div>
          </div>

          <div className={styles.sectionScrollable}>
            <p className={styles.sectionLabel}>KPI Tasks</p>
            {loading ? (
              <div className={styles.empty}>Loading...</div>
            ) : assignedTasks.length === 0 ? (
              <div className={styles.empty}>No tasks assigned yet</div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Task Name</th>
                      <th>Type</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedTasks.map((task, i) => (
                      <tr key={task.id}>
                        <td>{i + 1}</td>
                        <td>{task.title}</td>
                        <td>
                          <span className={task.taskType === 'OTHER' ? styles.badgeOther : styles.badgeKpi}>
                            {task.taskType === 'OTHER' ? 'Other' : 'KPI'}
                          </span>
                        </td>
                        <td>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => setConfirmTask(task)}
                            disabled={removeId === task.id}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>

    {confirmTask && (
      <ConfirmModal
        message="Do you want to remove this task?"
        loading={removeId === confirmTask.id}
        onConfirm={() => { handleRemove(confirmTask.id); setConfirmTask(null) }}
        onCancel={() => setConfirmTask(null)}
      />
    )}
    </>
  )
}

export default AssignTaskDrawer
