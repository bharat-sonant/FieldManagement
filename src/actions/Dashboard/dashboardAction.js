import { supabase } from '../../utils/supabase'

const getDateRange = (filter) => {
  const now = new Date()
  if (filter === 'TODAY') {
    const start = new Date(now); start.setHours(0, 0, 0, 0)
    const end   = new Date(now); end.setHours(23, 59, 59, 999)
    return { start: start.toISOString(), end: end.toISOString() }
  }
  if (filter === 'THIS_WEEK') {
    const day   = now.getDay()
    const start = new Date(now); start.setDate(now.getDate() - day); start.setHours(0, 0, 0, 0)
    const end   = new Date(now); end.setHours(23, 59, 59, 999)
    return { start: start.toISOString(), end: end.toISOString() }
  }
  if (filter === 'THIS_MONTH') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end   = new Date(now); end.setHours(23, 59, 59, 999)
    return { start: start.toISOString(), end: end.toISOString() }
  }
  return null
}

export const fetchDashboardData = async ({ setLoading, onSuccess, onError, dateFilter = 'ALL' }) => {
  setLoading(true)
  try {
    const range = getDateRange(dateFilter)

    let assignQuery = supabase
      .from('FETaskAssignments')
      .select('*, FETasks(title)')
      .order('created_at', { ascending: false })

    if (range) {
      assignQuery = assignQuery
        .gte('created_at', range.start)
        .lte('created_at', range.end)
    }

    const [feRes, assignRes] = await Promise.all([
      supabase
        .from('FieldExecutives')
        .select('employee_id, name, status, role'),
      assignQuery,
    ])

    if (feRes.error)     { onError(feRes.error.message);    return }
    if (assignRes.error) { onError(assignRes.error.message); return }

    const fieldExecutives = feRes.data.filter(f => f.role === 'FIELD_EXECUTIVE')

    // Worker stats
    const workers = {
      total:    fieldExecutives.length,
      active:   fieldExecutives.filter(f => f.status === 'ACTIVE').length,
      inactive: fieldExecutives.filter(f => f.status === 'INACTIVE').length,
    }

    // Task stats
    const assignments = assignRes.data
    const tasks = {
      total:      assignments.length,
      pending:    assignments.filter(a => (a.status || 'PENDING') === 'PENDING').length,
      inProgress: assignments.filter(a => a.status === 'IN_PROGRESS').length,
      paused:     assignments.filter(a => a.status === 'PAUSED').length,
      completed:  assignments.filter(a => a.status === 'COMPLETED').length,
    }

    // Worker performance
    const perfMap = {}
    fieldExecutives.forEach(fe => {
      perfMap[fe.employee_id] = {
        name:       fe.name,
        employeeId: fe.employee_id,
        status:     fe.status,
        pending:    0,
        inProgress: 0,
        paused:     0,
        completed:  0,
      }
    })
    assignments.forEach(a => {
      if (!perfMap[a.employee_id]) return
      const s = a.status || 'PENDING'
      if (s === 'PENDING')     perfMap[a.employee_id].pending++
      if (s === 'IN_PROGRESS') perfMap[a.employee_id].inProgress++
      if (s === 'PAUSED')      perfMap[a.employee_id].paused++
      if (s === 'COMPLETED')   perfMap[a.employee_id].completed++
    })
    const workerSummary = Object.values(perfMap)

    // Recent 5 tasks
    const recentTasks = assignments.slice(0, 5).map(a => ({
      id:         a.id,
      title:      a.FETasks?.title || '',
      assignedTo: perfMap[a.employee_id]?.name || a.employee_id,
      status:     a.status || 'PENDING',
      date:       new Date(a.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    }))

    onSuccess({ workers, tasks, workerSummary, recentTasks })
  } catch {
    onError('Something went wrong')
  } finally {
    setLoading(false)
  }
}
