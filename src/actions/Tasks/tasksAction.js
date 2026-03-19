import { supabase } from '../../utils/supabase'

export const fetchTasks = async ({ setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const { data, error } = await supabase
      .from('FETasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) { onError(error.message); return }
    onSuccess(data)
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}

export const addTask = async ({ title, description, deadline, priority, setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const payload = { title, description }
    if (deadline) payload.deadline = deadline
    if (priority) payload.priority = priority

    const { data, error } = await supabase
      .from('FETasks')
      .insert(payload)
      .select()
      .single()

    if (error) { onError(error.message); return }
    onSuccess(data)
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}

export const updateTask = async ({ id, title, description, deadline, priority, setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const payload = { title, description }
    if (deadline !== undefined) payload.deadline = deadline || null
    if (priority) payload.priority = priority

    const { data, error } = await supabase
      .from('FETasks')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) { onError(error.message); return }
    onSuccess(data)
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}

export const deleteTask = async ({ id, setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const { error } = await supabase
      .from('FETasks')
      .delete()
      .eq('id', id)

    if (error) { onError(error.message); return }
    onSuccess()
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}
