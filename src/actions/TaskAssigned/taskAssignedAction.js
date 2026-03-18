import { supabase } from '../../utils/supabase'
import { decrypt }  from '../../utils/crypto'

export const fetchActiveUsers = async ({ setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const { data, error } = await supabase
      .from('FieldExecutives')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('name', { ascending: true })

    if (error) { onError(error.message); return }

    onSuccess(await Promise.all(data.map(async (u) => ({
      id:           u.id,
      employeeId:   u.employee_id,
      name:         u.name,
      email:        await decrypt(u.email),
      mobileNumber: await decrypt(u.mobile_number),
      status:       u.status,
    }))))
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}

export const fetchAssignedTasks = async ({ employeeId, setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const { data, error } = await supabase
      .from('FETaskAssignments')
      .select('*, FETasks(*)')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false })

    if (error) { onError(error.message); return }

    onSuccess(data.map((a) => ({
      id:          a.id,
      taskId:      a.task_id,
      employeeId:  a.employee_id,
      assignedBy:  a.assigned_by,
      taskType:    a.task_type,
      title:       a.FETasks?.title       || '',
      description: a.FETasks?.description || '',
      createdAt:   a.created_at,
    })))
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}

export const assignTask = async ({ employeeId, taskId, assignedBy, taskType, setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const { data, error } = await supabase
      .from('FETaskAssignments')
      .insert({ employee_id: employeeId, task_id: taskId, assigned_by: assignedBy, task_type: taskType })
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

export const unassignTask = async ({ id, setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const { error } = await supabase
      .from('FETaskAssignments')
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

export const updateTaskType = async ({ id, taskType, setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const { error } = await supabase
      .from('FETaskAssignments')
      .update({ task_type: taskType })
      .eq('id', id)

    if (error) { onError(error.message); return }
    onSuccess()
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}
