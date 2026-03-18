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

export const addTask = async ({ title, description, setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const { data, error } = await supabase
      .from('FETasks')
      .insert({ title, description })
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

export const updateTask = async ({ id, title, description, setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const { data, error } = await supabase
      .from('FETasks')
      .update({ title, description })
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
