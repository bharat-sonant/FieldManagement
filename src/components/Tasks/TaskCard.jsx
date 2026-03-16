import { useState, useRef, useEffect } from 'react'
import { Eye, MoreVertical, Trash2, Pencil, X, ChevronDown } from 'lucide-react'
import styles from './TaskCard.module.css'

const STATUSES = [
  { key: 'open',        label: 'OPEN',        color: '#9ca3af' },
  { key: 'in-progress', label: 'IN-PROGRESS', color: '#6a85f1' },
  { key: 'pause',       label: 'PAUSE',       color: '#ef4444' },
  { key: 'done',        label: 'DONE',        color: '#22c55e' },
]

const TaskCard = ({ task, index, onDelete, onEdit }) => {
  const [showDrawer,  setShowDrawer]  = useState(false)
  const [showMenu,    setShowMenu]    = useState(false)
  const [showStatus,  setShowStatus]  = useState(false)
  const [status,      setStatus]      = useState('open')
  const menuRef   = useRef(null)
  const statusRef = useRef(null)
  const isKpi     = task.type === 'kpi'

  const currentStatus = STATUSES.find((s) => s.key === status)

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current   && !menuRef.current.contains(e.target))   setShowMenu(false)
      if (statusRef.current && !statusRef.current.contains(e.target)) setShowStatus(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <>
      <div className={styles.row}>
        {/* Index / Eye */}
        <div className={styles.indexCell} onClick={() => setShowDrawer(true)}>
          <span className={styles.indexNum}>{index}</span>
          <span className={styles.eyeIcon}><Eye size={14} /></span>
        </div>

        {/* Title */}
        <div className={styles.titleCell}>
          <span className={styles.title}>{task.title}</span>
        </div>

        {/* Meta */}
        <div className={styles.meta}>
          <span className={styles.duration}>{task.duration}</span>
          {/* Status dropdown */}
          <div className={styles.statusWrap} ref={statusRef}>
            <button
              className={styles.statusBtn}
              onClick={() => setShowStatus((v) => !v)}
              style={{ color: currentStatus.color }}
            >
              <span className={styles.statusLabel}>{currentStatus.label}</span>
              <ChevronDown size={11} className={styles.statusChevron} />
            </button>
            {showStatus && (
              <div className={styles.statusDropdown}>
                {STATUSES.map((s) => (
                  <button
                    key={s.key}
                    className={styles.statusOption}
                    onClick={() => { setStatus(s.key); setShowStatus(false) }}
                    style={{ color: s.color }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.avatar}>{task.assignedTo?.charAt(0)}</div>
        </div>

        {/* 3-dot menu */}
        <div className={styles.menuWrap} ref={menuRef}>
          <button className={styles.menuBtn} onClick={() => setShowMenu((v) => !v)}>
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <div className={styles.dropdown}>
              <button
                className={styles.editOption}
                onClick={() => { setShowMenu(false); onEdit(task) }}
              >
                <Pencil size={13} />
                Edit
              </button>
              <button
                className={styles.deleteOption}
                onClick={() => { setShowMenu(false); onDelete(task.id) }}
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right drawer */}
      {showDrawer && (
        <div className={styles.drawerOverlay} onClick={() => setShowDrawer(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div className={`${styles.drawerBar} ${isKpi ? styles.kpiBar : styles.otherBar}`} />
              <h3 className={styles.drawerTitle}>Task Detail</h3>
              <button className={styles.drawerClose} onClick={() => setShowDrawer(false)}>
                <X size={16} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              <div className={styles.drawerField}>
                <span className={styles.fieldLabel}>Title</span>
                <span className={styles.fieldValue}>{task.title}</span>
              </div>
              <div className={styles.drawerField}>
                <span className={styles.fieldLabel}>Description</span>
                <span className={styles.fieldValue}>{task.description}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TaskCard
