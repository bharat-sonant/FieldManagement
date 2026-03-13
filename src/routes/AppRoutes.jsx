import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Users from '../pages/Users'
import Tasks from '../pages/Tasks'
import Tracking from '../pages/Tracking'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/users" element={<Users />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/tracking" element={<Tracking />} />
    </Routes>
  )
}

export default AppRoutes
