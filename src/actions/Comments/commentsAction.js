import { supabase } from '../../utils/supabase'

export const fetchComments = async ({ assignmentId, onSuccess, onError }) => {
  try {
    const { data, error } = await supabase
      .from('FETaskComments')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: true })

    if (error) { onError(error.message); return }
    onSuccess(data.map(c => ({
      id:          c.id,
      assignmentId: c.assignment_id,
      commentedBy: c.commented_by,
      role:        c.role,
      comment:     c.comment,
      createdAt:   c.created_at,
    })))
  } catch {
    onError('Something went wrong')
  }
}

export const addComment = async ({ assignmentId, comment, commentedBy, role, setLoading, onSuccess, onError }) => {
  setLoading(true)
  try {
    const { data, error } = await supabase
      .from('FETaskComments')
      .insert({
        assignment_id: assignmentId,
        commented_by:  commentedBy,
        role,
        comment,
      })
      .select()
      .single()

    if (error) { onError(error.message); return }
    onSuccess({
      id:           data.id,
      assignmentId: data.assignment_id,
      commentedBy:  data.commented_by,
      role:         data.role,
      comment:      data.comment,
      createdAt:    data.created_at,
    })
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}
