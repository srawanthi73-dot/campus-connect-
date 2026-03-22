import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useThemeStore, useAuthStore } from './store/store'
import Layout from './components/Layout'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import EventDetails from './pages/EventDetails'
import Register from './pages/Register'
import Bookmarks from './pages/Bookmarks'
import FAQ from './pages/FAQ'
import Profile from './pages/Profile'
import ResetPassword from './pages/ResetPassword'

// Admin Pages
import AdminDashboard from './pages/AdminDashboard'
import ManageEvents from './pages/Admin/ManageEvents'
import ViewRegistrations from './pages/Admin/ViewRegistrations'
import UserManagement from './pages/Admin/UserManagement'
import FAQManagement from './pages/Admin/FAQManagement'

const ProtectedRoute = ({ children, role }) => {
  const { user, role: userRole } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (role && userRole !== role) return <Navigate to="/" replace />
  return children
}

function App() {
  const { darkMode } = useThemeStore()
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          className: darkMode ? 'dark-toast' : '',
          style: darkMode ? { background: '#121212', color: '#fff', border: '1px solid #333' } : {} 
        }} 
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/register/:id" element={<Register />} />
          <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute role="admin"><ManageEvents /></ProtectedRoute>} />
          <Route path="/admin/registrations" element={<ProtectedRoute role="admin"><ViewRegistrations /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/faq" element={<ProtectedRoute role="admin"><FAQManagement /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
