import { supabase } from '../../utils/supabase'
import { decrypt }  from '../../utils/crypto'

const parseProofUrls = (val) => {
  if (!val) return []
  try { return JSON.parse(val) } catch { return [val] }
}

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
      id:             a.id,
      taskId:         a.task_id,
      employeeId:     a.employee_id,
      assignedBy:     a.assigned_by,
      taskType:       a.task_type,
      title:          a.FETasks?.title       || '',
      description:    a.FETasks?.description || '',
      priority:       a.FETasks?.priority    || '',
      createdAt:      a.created_at,
      status:         a.status         || 'PENDING',
      completionNote: a.completion_note || '',
      completedAt:    a.completed_at   || null,
      proofUrls:      parseProofUrls(a.proof_url),
    })))
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}

export const uploadProofs = async ({ files, employeeId, taskId }) => {
  const urls = []
  for (const file of files) {
    const ext  = file.name.split('.').pop()
    const path = `${employeeId}/${taskId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from('task-proofs')
      .upload(path, file, { contentType: file.type, upsert: true })

    if (error) throw new Error(error.message)

    const { data: { publicUrl } } = supabase.storage
      .from('task-proofs')
      .getPublicUrl(data.path)

    urls.push(publicUrl)
  }
  return urls
}

export const updateTaskStatus = async ({ id, status, completionNote, proofUrls, setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const updates = { status }
    if (status === 'COMPLETED') {
      updates.completion_note = completionNote || null
      updates.completed_at    = new Date().toISOString()
      updates.proof_url       = proofUrls?.length ? JSON.stringify(proofUrls) : null
    }

    const { error } = await supabase
      .from('FETaskAssignments')
      .update(updates)
      .eq('id', id)

    if (error) { onError(error.message); return }
    onSuccess()
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
