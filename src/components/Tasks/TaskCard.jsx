import { useState, useRef, useEffect } from 'react'
import { Eye, MoreVertical, Trash2, Pencil, X } from 'lucide-react'
import styles from './TaskCard.module.css'

const TaskCard = ({ task, index, onDelete, onEdit }) => {
  const [showDrawer, setShowDrawer] = useState(false)
  const [showMenu,   setShowMenu]   = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <>
      <div className={styles.row}>
        <div className={styles.indexCell} onClick={() => setShowDrawer(true)}>
          <span className={styles.indexNum}>{index}</span>
          <span className={styles.eyeIcon}><Eye size={14} /></span>
        </div>

        <div className={styles.titleCell}>
          <span className={styles.title}>{task.title}</span>
        </div>


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
                <Pencil size={13} /> Edit
              </button>
              <button
                className={styles.deleteOption}
                onClick={() => { setShowMenu(false); onDelete(task) }}
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {showDrawer && (
        <div className={styles.drawerOverlay} onClick={() => setShowDrawer(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div className={styles.drawerBar} />
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
                <span className={styles.fieldValue}>{task.description || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TaskCard
