import { useState } from 'react'
import { Plus } from 'lucide-react'
import Navbar from '../components/Navbar/Navbar'
import TaskCard from '../components/Tasks/TaskCard'
import AddTaskModal from '../components/Tasks/AddTaskModal'
import styles from './Tasks.module.css'

const INITIAL_TASKS = [
  { id: 1, title: 'Daily Site Visit',           description: 'Visit all assigned locations and verify waste collection status.',  assignedTo: 'Ajay',   duration: '45 min' },
  { id: 2, title: 'Submit Daily Report',        description: 'Submit end-of-day field activity report to manager.',               assignedTo: 'Amit',   duration: '30 min' },
  { id: 3, title: 'Vehicle Inspection',         description: 'Check vehicle condition before starting field operations.',          assignedTo: 'Ramesh', duration: '20 min' },
]

const Tasks = () => {
  const [tasks,     setTasks]     = useState(INITIAL_TASKS)
  const [showModal, setShowModal] = useState(false)
  const [editTask,  setEditTask]  = useState(null)

  const handleDelete = (id) => setTasks((prev) => prev.filter((t) => t.id !== id))

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
          {tasks.length === 0 ? (
            <div className={styles.empty}>No tasks found</div>
          ) : (
            <div className={styles.list}>
              {tasks.map((task, i) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={i + 1}
                  onDelete={handleDelete}
                  onEdit={setEditTask}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <AddTaskModal onClose={() => setShowModal(false)} />
      )}

      {editTask && (
        <AddTaskModal task={editTask} onClose={() => setEditTask(null)} />
      )}
    </div>
  )
}

export default Tasks
