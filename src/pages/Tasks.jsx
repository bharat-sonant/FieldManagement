import { useState } from 'react'
import { Target, Shuffle } from 'lucide-react'
import Navbar from '../components/Navbar/Navbar'
import TaskTabs from '../components/Tasks/TaskTabs'
import TaskCard from '../components/Tasks/TaskCard'
import AddTaskModal from '../components/Tasks/AddTaskModal'
import styles from './Tasks.module.css'

const INITIAL_TASKS = [
  { id: 1, type: 'kpi',   title: 'Daily Site Visit',           description: 'Visit all assigned locations and verify waste collection status.',  assignedTo: 'Ajay',   duration: '45 min' },
  { id: 2, type: 'kpi',   title: 'Submit Daily Report',        description: 'Submit end-of-day field activity report to manager.',               assignedTo: 'Amit',   duration: '30 min' },
  { id: 3, type: 'kpi',   title: 'Vehicle Inspection',         description: 'Check vehicle condition before starting field operations.',          assignedTo: 'Ramesh', duration: '20 min' },
  { id: 4, type: 'other', title: 'Fix Broken Bin at Sector 9', description: 'Broken waste bin reported by resident. Needs immediate repair.',    assignedTo: 'Govind', duration: '1 hr 30 min' },
  { id: 5, type: 'other', title: 'New Area Survey',            description: 'Survey new residential area for waste collection route planning.',   assignedTo: 'Karan',  duration: '2 hr 15 min' },
]

const Tasks = () => {
  const [tasks, setTasks]         = useState(INITIAL_TASKS)
  const [activeTab, setActiveTab] = useState('kpi')
  const [modalType, setModalType] = useState(null)
  const [editTask,  setEditTask]  = useState(null)

  const filteredTasks = tasks.filter((t) => t.type === activeTab)

  const handleDelete = (id) => setTasks((prev) => prev.filter((t) => t.id !== id))

  return (
    <div className={styles.tasksPage}>
      <Navbar />

      <div className={styles.body}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.heading}>Task Management</h2>
            <p className={styles.sub}>Manage KPI and other field tasks</p>
          </div>
          <div className={styles.btnGroup}>
            <button className={`${styles.addBtn} ${styles.kpiBtn}`} onClick={() => setModalType('kpi')}>
              <Target size={15} />
              Add KPI Task
            </button>
            <button className={`${styles.addBtn} ${styles.otherBtn}`} onClick={() => setModalType('other')}>
              <Shuffle size={15} />
              Add Other Task
            </button>
          </div>
        </div>

        <TaskTabs activeTab={activeTab} onChange={setActiveTab} />

        <div className={styles.content}>
          {filteredTasks.length === 0 ? (
            <div className={styles.empty}>No tasks found</div>
          ) : (
            <div className={styles.list}>
              {filteredTasks.map((task, i) => (
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

      {modalType && (
        <AddTaskModal type={modalType} onClose={() => setModalType(null)} />
      )}

      {editTask && (
        <AddTaskModal type={editTask.type} task={editTask} onClose={() => setEditTask(null)} />
      )}
    </div>
  )
}

export default Tasks
