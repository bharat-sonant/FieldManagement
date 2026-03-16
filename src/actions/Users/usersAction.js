import api from '../../utils/api'

export const updateUser = async (formData, setLoading, onSuccess, onError) => {
  try {
    setLoading(true)
    const result = await api.patch(`fe-users/update`, {
      employeeId:   formData.employeeId,
      name:         formData.name,
      email:        formData.email,
      mobileNumber: formData.mobile,
    })

    if (result?.status === 'success') {
      onSuccess(result.data)
    } else {
      onError(result?.message || 'Failed to update user')
    }
  } catch (error) {
    console.error('Error in updating user:', error)
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}

export const addUser = async (formData, setLoading, onSuccess, onError) => {
  try {
    setLoading(true)
    const result = await api.post(`fe-users/add`, {
      name:         formData.name,
      employeeId:   formData.empId,
      email:        formData.email,
      mobileNumber: formData.mobile,
    })

    if (result?.status === 'success') {
      onSuccess(result.data)
    } else {
      onError(result?.message || 'Failed to add user')
    }
  } catch (error) {
    console.error('Error in adding user:', error)
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}

export const changeUserStatus = async (employeeId, currentStatus, setLoading, onSuccess) => {
  try {
    setLoading(true)
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    const result = await api.patch(`fe-users/change-fe-status`, { employeeId, status: newStatus })

    if (result?.status === 'success') {
      onSuccess(result.data)
    }
  } catch (error) {
    console.error('Error in changing user status:', error)
  } finally {
    setLoading(false)
  }
}

export const fetchUserData = async (setSelectedUser, setUsers, setLoading, setActiveInactiveUserList) => {
  try {
    setLoading(true)
    const result = await api.get(`fe-users/get-all`)

    if (result?.status === 'success') {
      const userList = result.data || []
      setUsers(userList)

      const activeInactive = userList.filter(
        (u) => u.status === 'ACTIVE' || u.status === 'INACTIVE'
      )
      setActiveInactiveUserList(activeInactive)

      const sortedActive = [...userList]
        .filter((u) => u.status === 'ACTIVE')
        .sort((a, b) => a.name.localeCompare(b.name))

      setSelectedUser(sortedActive[0] || null)
    } else {
      setSelectedUser(null)
      setUsers([])
    }
  } catch (error) {
    console.error('Error in fetching users list:', error)
    setUsers([])
    setSelectedUser(null)
  } finally {
    setLoading(false)
  }
}
