import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, CheckCircle2, Clock, PauseCircle, Loader2 } from 'lucide-react'
import { fetchAssignedTasks } from '../../actions/TaskAssigned/taskAssignedAction'
import FEBottomNav from '../../components/FE/FEBottomNav'
import styles from './FEHome.module.css'

const STATUS_LABEL = { PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', PAUSED: 'Paused' }
const STATUS_CLASS  = { PENDING: 'pending', IN_PROGRESS: 'inProgress', COMPLETED: 'completed', PAUSED: 'paused' }

const FEHome = () => {
  const navigate  = useNavigate()
  const user      = JSON.parse(localStorage.getItem('user') || '{}')
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('ALL')

  useEffect(() => {
    fetchAssignedTasks({
      employeeId: user.employeeId,
      setLoading,
      onSuccess: setTasks,
      onError:   () => {},
    })
  }, [user.employeeId])

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter)

  const counts = {
    total:     tasks.length,
    pending:   tasks.filter(t => t.status === 'PENDING').length,
    paused:    tasks.filter(t => t.status === 'PAUSED').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>Hello,</p>
          <h1 className={styles.name}>{user.name}</h1>
        </div>
        <div className={styles.avatar}>{user.name?.[0]?.toUpperCase()}</div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <ClipboardList size={18} color="#4f46e5" />
          <span className={styles.statNum}>{counts.total}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={styles.statCard}>
          <Clock size={18} color="#f59e0b" />
          <span className={styles.statNum}>{counts.pending}</span>
          <span className={styles.statLabel}>Pending</span>
        </div>
        <div className={styles.statCard}>
          <PauseCircle size={18} color="#7c3aed" />
          <span className={styles.statNum}>{counts.paused}</span>
          <span className={styles.statLabel}>Paused</span>
        </div>
        <div className={styles.statCard}>
          <CheckCircle2 size={18} color="#10b981" />
          <span className={styles.statNum}>{counts.completed}</span>
          <span className={styles.statLabel}>Done</span>
        </div>
      </div>

      <div className={styles.filterRow}>
        {['ALL', 'PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED'].map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'All' : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      <div className={styles.taskList}>
        {loading ? (
          <div className={styles.center}><Loader2 size={24} className={styles.spin} /></div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>No tasks found</div>
        ) : (
          filtered.map(task => (
            <div key={task.id} className={styles.taskCard} onClick={() => navigate(`/fe/task/${task.id}`)}>
              <div className={styles.taskTop}>
                <h3 className={styles.taskTitle}>{task.title}</h3>
                <span className={`${styles.badge} ${styles[STATUS_CLASS[task.status]]}`}>
                  {STATUS_LABEL[task.status]}
                </span>
              </div>
              {task.description && (
                <p className={styles.taskDesc}>{task.description}</p>
              )}
              <p className={styles.taskMeta}>
                {task.taskType} · {new Date(task.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>
          ))
        )}
      </div>

      <div className={styles.bottomSpace} />
      <FEBottomNav />
    </div>
  )
}

export default FEHome
