import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Users from '../pages/Users'
import Tasks from '../pages/Tasks'
import Tracking from '../pages/Tracking'
import TaskAssigned from '../pages/TaskAssigned'
import { supabase } from '../utils/supabase'

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user')
  return user ? children : <Navigate to="/login" replace />
}

const AppRoutes = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) return

    const user = JSON.parse(stored)

    const channel = supabase
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

    return () => { supabase.removeChannel(channel) }
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
    </Routes>
  )
}

export default AppRoutes
