import { useState, useEffect, useRef } from 'react'
import { Users, ClipboardList, CheckCircle2, Clock, AlertCircle, TrendingUp, Loader2 } from 'lucide-react'
import Navbar from '../components/Navbar/Navbar'
import { fetchDashboardData } from '../actions/Dashboard/dashboardAction'
import { supabase } from '../utils/supabase'
import styles from './Dashboard.module.css'

const STATUS_LABEL = { PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', PAUSED: 'Paused' }
const STATUS_CLASS  = { PENDING: 'pending', IN_PROGRESS: 'inProgress', COMPLETED: 'completed', PAUSED: 'paused' }

const DATE_FILTERS = [
  { value: 'ALL',        label: 'All'        },
  { value: 'TODAY',      label: 'Today'      },
  { value: 'THIS_WEEK',  label: 'This Week'  },
  { value: 'THIS_MONTH', label: 'This Month' },
]

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [loading,       setLoading]       = useState(true)
  const [dateFilter,    setDateFilter]    = useState('ALL')
  const [workers,       setWorkers]       = useState({ total: 0, active: 0, inactive: 0 })
  const [tasks,         setTasks]         = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 })
  const [workerSummary, setWorkerSummary] = useState([])
  const [recentTasks,   setRecentTasks]   = useState([])

  const dateFilterRef = useRef('ALL')

  const loadData = (filter) => {
    fetchDashboardData({
      setLoading,
      dateFilter: filter,
      onSuccess: (data) => {
        setWorkers(data.workers)
        setTasks(data.tasks)
        setWorkerSummary(data.workerSummary)
        setRecentTasks(data.recentTasks)
      },
      onError: () => {},
    })
  }

  useEffect(() => {
    dateFilterRef.current = dateFilter
    loadData(dateFilter)
  }, [dateFilter])

  // realtime: re-fetch when any task status changes
  useEffect(() => {
    const ch = supabase
      .channel('dashboard-status-watch')
      .on('postgres_changes', {
        event:  'UPDATE',
        schema: 'public',
        table:  'FETaskAssignments',
      }, () => {
        loadData(dateFilterRef.current)
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  const completionRate = tasks.total > 0
    ? Math.round((tasks.completed / tasks.total) * 100)
    : 0

  return (
    <div className={styles.dashboardPage}>
      <Navbar />
      <div className={styles.content}>

        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.heading}>Good morning, {user.name?.split(' ')[0] || 'Admin'} 👋</h1>
            <p className={styles.sub}>Here's what's happening with your field team today.</p>
          </div>
          <div className={styles.completionBadge}>
            <span className={styles.completionNum}>{completionRate}%</span>
            <span className={styles.completionLabel}>Completion Rate</span>
          </div>
        </div>

        {/* Date Filter Tabs */}
        <div className={styles.filterTabs}>
          {DATE_FILTERS.map(f => (
            <button
              key={f.value}
              className={`${styles.filterTab} ${dateFilter === f.value ? styles.filterTabActive : ''}`}
              onClick={() => setDateFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Stats Row — fixed, no scroll */}
        <div className={styles.statsRow}>
            <div className={`${styles.statCard} ${styles.cardBlue}`}>
              <div className={styles.statLeft}>
                <p className={styles.statLabel}>Total Workers</p>
                <p className={styles.statNum}>{workers.total}</p>
                <div className={styles.statSub}>
                  <span className={styles.greenDot} />{workers.active} Active
                </div>
              </div>
              <div className={`${styles.statIcon} ${styles.iconBlue}`}><Users size={24} /></div>
            </div>

            <div className={`${styles.statCard} ${styles.cardYellow}`}>
              <div className={styles.statLeft}>
                <p className={styles.statLabel}>Pending Tasks</p>
                <p className={styles.statNum}>{tasks.pending}</p>
                <div className={styles.statSub}>Needs attention</div>
              </div>
              <div className={`${styles.statIcon} ${styles.iconYellow}`}><Clock size={24} /></div>
            </div>

            <div className={`${styles.statCard} ${styles.cardOrange}`}>
              <div className={styles.statLeft}>
                <p className={styles.statLabel}>In Progress</p>
                <p className={styles.statNum}>{tasks.inProgress}</p>
                <div className={styles.statSub}>Currently active</div>
              </div>
              <div className={`${styles.statIcon} ${styles.iconOrange}`}><AlertCircle size={24} /></div>
            </div>

            <div className={`${styles.statCard} ${styles.cardGreen}`}>
              <div className={styles.statLeft}>
                <p className={styles.statLabel}>Completed</p>
                <p className={styles.statNum}>{tasks.completed}</p>
                <div className={styles.statSub}>Out of {tasks.total} total</div>
              </div>
              <div className={`${styles.statIcon} ${styles.iconGreen}`}><CheckCircle2 size={24} /></div>
            </div>
          </div>

        <div className={styles.scrollArea}>
          {/* Bottom Grid */}
          <div className={styles.bottomGrid}>

            {/* Worker Table */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <TrendingUp size={16} color="#2d3a8c" />
                  <h2 className={styles.cardTitle}>Worker Performance</h2>
                </div>
              </div>
              {loading ? (
                <div className={styles.center}><Loader2 size={22} className={styles.spin} /></div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Worker</th>
                        <th>Pending</th>
                        <th>In Progress</th>
                        <th>Paused</th>
                        <th>Completed</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workerSummary.map(w => (
                        <tr key={w.employeeId}>
                          <td>
                            <div className={styles.workerCell}>
                              <div className={styles.avatar}>{w.name[0]}</div>
                              <div>
                                <p className={styles.wName}>{w.name}</p>
                                <p className={styles.wId}>{w.employeeId}</p>
                              </div>
                            </div>
                          </td>
                          <td><span className={`${styles.pill} ${styles.pending}`}>{w.pending}</span></td>
                          <td><span className={`${styles.pill} ${styles.inProgress}`}>{w.inProgress}</span></td>
                          <td><span className={`${styles.pill} ${styles.paused}`}>{w.paused}</span></td>
                          <td><span className={`${styles.pill} ${styles.completed}`}>{w.completed}</span></td>
                          <td>
                            <span className={`${styles.statusPill} ${w.status === 'ACTIVE' ? styles.dotActive : styles.dotInactive}`}>
                              {w.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Tasks */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <ClipboardList size={16} color="#2d3a8c" />
                  <h2 className={styles.cardTitle}>Recent Tasks</h2>
                </div>
              </div>
              {loading ? (
                <div className={styles.center}><Loader2 size={22} className={styles.spin} /></div>
              ) : (
                <div className={styles.taskList}>
                  {recentTasks.length === 0 ? (
                    <div className={styles.empty}>No tasks yet</div>
                  ) : recentTasks.map(t => (
                    <div key={t.id} className={styles.taskRow}>
                      <div className={styles.taskDot} />
                      <div className={styles.taskInfo}>
                        <p className={styles.taskTitle}>{t.title}</p>
                        <p className={styles.taskMeta}>{t.assignedTo} · {t.date}</p>
                      </div>
                      <span className={`${styles.badge} ${styles[STATUS_CLASS[t.status]]}`}>
                        {STATUS_LABEL[t.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
