import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import Navbar from '../components/Navbar/Navbar'
import TaskCard from '../components/Tasks/TaskCard'
import AddTaskModal from '../components/Tasks/AddTaskModal'
import ConfirmModal from '../components/Users/ConfirmModal'
import { fetchTasks, deleteTask } from '../actions/Tasks/tasksAction'
import { setAlertMessage } from '../utils/setAlertMessage'
import styles from './Tasks.module.css'

const Tasks = () => {
  const [tasks,         setTasks]         = useState([])
  const [loading,       setLoading]       = useState(false)
  const [showModal,     setShowModal]     = useState(false)
  const [editTask,      setEditTask]      = useState(null)
  const [confirmTask,   setConfirmTask]   = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchTasks({
      setLoading,
      onSuccess: (data) => setTasks(data),
      onError:   (msg)  => setAlertMessage('error', msg),
    })
  }, [])

  const handleAddSuccess = (newTask, formData) => {
    const task = newTask || { id: Date.now(), ...formData }
    setTasks((prev) => [...prev, task])
    setAlertMessage('success', 'Task added successfully')
    setShowModal(false)
  }

  const handleUpdateSuccess = (updatedTask, formData) => {
    const updated = updatedTask || { ...editTask, ...formData }
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setAlertMessage('success', 'Task updated successfully')
    setEditTask(null)
  }

  const handleDeleteConfirm = () => {
    deleteTask({
      id:         confirmTask.id,
      setLoading: setDeleteLoading,
      onSuccess:  () => {
        setTasks((prev) => prev.filter((t) => t.id !== confirmTask.id))
        setAlertMessage('success', 'Task deleted successfully')
        setConfirmTask(null)
      },
      onError: (msg) => {
        setAlertMessage('error', msg)
        setConfirmTask(null)
      },
    })
  }

  return (
    <div className={styles.tasksPage}>
      <Navbar />

      <div className={styles.body}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.heading}>Task Management</h2>
            <p className={styles.sub}>Manage and track field tasks</p>
          </div>
          <button className={styles.addBtn} onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Add Task
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.empty}>Loading...</div>
          ) : tasks.length === 0 ? (
            <div className={styles.empty}>No tasks found</div>
          ) : (
            <div className={styles.list}>
              {tasks.map((task, i) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={i + 1}
                  onDelete={(t) => setConfirmTask(t)}
                  onEdit={setEditTask}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <AddTaskModal
          onClose={() => setShowModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {editTask && (
        <AddTaskModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {confirmTask && (
        <ConfirmModal
          message={`Do you want to delete "${confirmTask.title}"?`}
          loading={deleteLoading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmTask(null)}
        />
      )}
    </div>
  )
}

export default Tasks
