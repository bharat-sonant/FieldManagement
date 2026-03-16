import { Target, Shuffle } from 'lucide-react'
import styles from './TaskTabs.module.css'

const TaskTabs = ({ activeTab, onChange }) => {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${activeTab === 'kpi' ? styles.active : ''}`}
        onClick={() => onChange('kpi')}
      >
        <Target size={16} />
        KPI Tasks
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'other' ? styles.active : ''}`}
        onClick={() => onChange('other')}
      >
        <Shuffle size={16} />
        Other Tasks
      </button>
    </div>
  )
}

export default TaskTabs
