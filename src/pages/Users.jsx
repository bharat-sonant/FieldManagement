import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import Navbar from '../components/Navbar/Navbar'
import UsersSidebar from '../components/Users/UsersSidebar'
import UserDetail from '../components/Users/UserDetail'
import AddUserModal from '../components/Users/AddUserModal'
import { fetchUserData } from '../actions/Users/usersAction'
import { setAlertMessage } from '../utils/setAlertMessage'
import styles from './Users.module.css'

const Users = () => {
  const [selectedUser, setSelectedUser]                     = useState(null)
  const [activeInactiveUserList, setActiveInactiveUserList] = useState([])
  const [filter, setFilter]                                 = useState('ACTIVE')
  const [loading, setLoading]                               = useState(true)
  const [showModal, setShowModal]                           = useState(false)

  useEffect(() => {
    fetchUserData(setSelectedUser, () => {}, setLoading, setActiveInactiveUserList)
  }, [])

  const filteredUsers = [...(filter === 'ALL'
    ? activeInactiveUserList
    : activeInactiveUserList.filter((u) => u.status === filter)
  )].sort((a, b) => a.name.localeCompare(b.name))

  const handleFilterChange = (val) => {
    setFilter(val)
    const newList = [...(val === 'ALL'
      ? activeInactiveUserList
      : activeInactiveUserList.filter((u) => u.status === val)
    )].sort((a, b) => a.name.localeCompare(b.name))
    setSelectedUser(newList[0] || null)
  }

  return (
    <div className={styles.usersPage}>
      <Navbar />

      <div className={styles.body}>
        <UsersSidebar
          users={filteredUsers}
          selectedUser={selectedUser}
          onSelect={setSelectedUser}
          filter={filter}
          onFilterChange={handleFilterChange}
          loading={loading}
          loggedInEmployeeId={JSON.parse(localStorage.getItem('user') || '{}').employeeId}
        />
        <UserDetail
          user={selectedUser}
          loading={loading}
          loggedInEmployeeId={JSON.parse(localStorage.getItem('user') || '{}').employeeId}
          onUserUpdate={(updatedUser) => {
            setActiveInactiveUserList((prev) =>
              prev.map((u) => u.employeeId === updatedUser.employeeId ? updatedUser : u)
            )
            setSelectedUser(updatedUser)
            setAlertMessage('success', `${updatedUser.name} updated successfully`)
          }}
          onStatusChange={(updatedUser) => {
            const updatedList = activeInactiveUserList.map((u) =>
              u.employeeId === updatedUser.employeeId ? { ...u, status: updatedUser.status } : u
            )
            setActiveInactiveUserList(updatedList)
            setAlertMessage('success', `${selectedUser?.name} ${updatedUser.status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`)

            const newFilteredList = [...(filter === 'ALL'
              ? updatedList
              : updatedList.filter((u) => u.status === filter)
            )].sort((a, b) => a.name.localeCompare(b.name))

            const currentIndex = filteredUsers.findIndex((u) => u.employeeId === updatedUser.employeeId)
            const nextUser = newFilteredList[currentIndex] || newFilteredList[currentIndex - 1] || newFilteredList[0] || null
            setSelectedUser(nextUser)
          }}
        />
      </div>

      <button className={styles.fab} onClick={() => setShowModal(true)}>
        <Plus size={22} />
      </button>

      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onSuccess={(newUser) => {
            setActiveInactiveUserList((prev) => [...prev, newUser])
            setAlertMessage('success', `${newUser.name} added successfully`)
          }}
        />
      )}

    </div>
  )
}

export default Users
