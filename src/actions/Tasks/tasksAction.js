import api from '../../utils/api'

export const fetchTasks = async ({ setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const result = await api.get('/tasks')
    if (result?.success) {
      onSuccess(result?.data?.tasks || [])
    } else {
      onError(result?.message || 'Failed to fetch tasks')
    }
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}

export const addTask = async ({ title, description, setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const result = await api.post('/tasks/create', { title, description })
    if (result?.success) {
      onSuccess(result?.data)
    } else {
      onError(result?.message || 'Failed to add task')
    }
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}

export const updateTask = async ({ id, title, description, setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const result = await api.patch(`/tasks/${id}`, { title, description })
    if (result?.success) {
      onSuccess(result?.data)
    } else {
      onError(result?.message || 'Failed to update task')
    }
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}

export const deleteTask = async ({ id, setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const result = await api.delete(`/tasks/${id}`)
    if (result?.success) {
      onSuccess()
    } else {
      onError(result?.message || 'Failed to delete task')
    }
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}
