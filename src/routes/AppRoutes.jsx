import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Users from '../pages/Users'
import Tasks from '../pages/Tasks'
import Tracking from '../pages/Tracking'
import TaskAssigned from '../pages/TaskAssigned'
import FEHome from '../pages/FE/FEHome'
import FETaskDetail from '../pages/FE/FETaskDetail'
import FEProfile from '../pages/FE/FEProfile'
import { supabase } from '../utils/supabase'
import { setAlertMessage } from '../utils/setAlertMessage'

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user')
  return user ? children : <Navigate to="/login" replace />
}

const FERoute = ({ children }) => {
  const stored = localStorage.getItem('user')
  if (!stored) return <Navigate to="/login" replace />
  const user = JSON.parse(stored)
  return user.role === 'FIELD_EXECUTIVE' ? children : <Navigate to="/dashboard" replace />
}

const AppRoutes = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) return

    const user = JSON.parse(stored)

    // Channel 1: watch own FieldExecutives row for deactivation
    const statusChannel = supabase
      .channel('user-status-watch')
      .on('postgres_changes', {
        event:  'UPDATE',
        schema: 'public',
        table:  'FieldExecutives',
        filter: `employee_id=eq.${user.employeeId}`,
      }, (payload) => {
        if (payload.new.status === 'INACTIVE') {
          localStorage.removeItem('user')
          navigate('/login', { replace: true })
        }
      })
      .subscribe()

    // Channel 2 (ADMIN): notify when any assignment is completed
    const adminChannel = user.role === 'ADMIN'
      ? supabase
          .channel('admin-task-complete')
          .on('postgres_changes', {
            event:  'UPDATE',
            schema: 'public',
            table:  'FETaskAssignments',
          }, async (payload) => {
            if (payload.new.status !== 'COMPLETED') return
            try {
              const [feRes] = await Promise.all([
                supabase.from('FieldExecutives').select('name').eq('employee_id', payload.new.employee_id).single(),
              ])
              const workerName = feRes.data?.name || payload.new.employee_id
              setAlertMessage('success', `${workerName} completed a task`)
            } catch {
              setAlertMessage('success', 'A task was completed')
            }
          })
          .subscribe()
      : null

    // Channel 3 (FIELD_EXECUTIVE): notify when a new task is assigned to them
    const feChannel = user.role === 'FIELD_EXECUTIVE'
      ? supabase
          .channel('fe-task-assigned')
          .on('postgres_changes', {
            event:  'INSERT',
            schema: 'public',
            table:  'FETaskAssignments',
            filter: `employee_id=eq.${user.employeeId}`,
          }, async (payload) => {
            try {
              const { data } = await supabase.from('FETasks').select('title').eq('id', payload.new.task_id).single()
              setAlertMessage('success', `New task assigned: "${data?.title || 'a task'}"`)
            } catch {
              setAlertMessage('success', 'New task assigned to you')
            }
          })
          .subscribe()
      : null

    // Channel 4 (ADMIN): notify when FE adds a comment
    const commentChannel = user.role === 'ADMIN'
      ? supabase
          .channel('admin-fe-comment')
          .on('postgres_changes', {
            event:  'INSERT',
            schema: 'public',
            table:  'FETaskComments',
          }, async (payload) => {
            if (payload.new.role !== 'FIELD_EXECUTIVE') return
            try {
              const assignRes = await supabase
                .from('FETaskAssignments')
                .select('employee_id, task_id')
                .eq('id', payload.new.assignment_id)
                .single()
              const [feRes] = await Promise.all([
                supabase.from('FieldExecutives').select('name').eq('employee_id', assignRes.data?.employee_id).single(),
              ])
              const name  = feRes.data?.name  || 'A field executive'
              setAlertMessage('info', `${name} commented on a task`)
            } catch {
              setAlertMessage('info', 'New comment from field executive')
            }
          })
          .subscribe()
      : null

    return () => {
      supabase.removeChannel(statusChannel)
      if (adminChannel)    supabase.removeChannel(adminChannel)
      if (feChannel)       supabase.removeChannel(feChannel)
      if (commentChannel)  supabase.removeChannel(commentChannel)
    }
  }, [navigate])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/users"         element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/tasks"         element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
      <Route path="/tracking"      element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
      <Route path="/task-assigned" element={<ProtectedRoute><TaskAssigned /></ProtectedRoute>} />
      <Route path="/fe/home"       element={<FERoute><FEHome /></FERoute>} />
      <Route path="/fe/task/:id"   element={<FERoute><FETaskDetail /></FERoute>} />
      <Route path="/fe/profile"    element={<FERoute><FEProfile /></FERoute>} />
    </Routes>
  )
}

export default AppRoutes
