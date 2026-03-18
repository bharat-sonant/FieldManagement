import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar/Navbar'
import AssignTaskDrawer from '../components/TaskAssigned/AssignTaskDrawer'
import { fetchActiveUsers } from '../actions/TaskAssigned/taskAssignedAction'
import { setAlertMessage } from '../utils/setAlertMessage'
import styles from './TaskAssigned.module.css'

const TaskAssigned = () => {
  const [users,         setUsers]         = useState([])
  const [loading,       setLoading]       = useState(false)
  const [selectedUser,  setSelectedUser]  = useState(null)

  useEffect(() => {
    fetchActiveUsers({
      setLoading,
      onSuccess: setUsers,
      onError:   (msg) => setAlertMessage('error', msg),
    })
  }, [])

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.body}>
        <div className={styles.header}>
          <h2 className={styles.heading}>Task Assigned</h2>
          <p className={styles.sub}>Assign KPI tasks to field executives</p>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Employee Code</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className={styles.empty}>Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className={styles.empty}>No field executives found</td></tr>
              ) : (
                users.map((user, i) => (
                  <tr key={user.employeeId}>
                    <td>{i + 1}</td>
                    <td>{user.employeeId}</td>
                    <td>{user.name}</td>
                    <td>{user.mobileNumber || '—'}</td>
                    <td>
                      <button
                        className={styles.assignBtn}
                        onClick={() => setSelectedUser(user)}
                      >
                        Add KPI Tasks
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <AssignTaskDrawer
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  )
}

export default TaskAssigned
