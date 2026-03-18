import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Users from '../pages/Users'
import Tasks from '../pages/Tasks'
import Tracking from '../pages/Tracking'
import TaskAssigned from '../pages/TaskAssigned'

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user')
  return user ? children : <Navigate to="/login" replace />
}

const AppRoutes = () => {
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
