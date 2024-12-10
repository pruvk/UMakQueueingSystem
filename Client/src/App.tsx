import { useEffect } from 'react'
import './index.css'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ThemeProvider } from "@/components/theme-provider"
import AdminLayout from './views/Admin/AdminPage'
import Login from './views/Login'
import Users from './views/Admin/Users'
import Dashboard from './views/Admin/Dashboard'

// Protected Route component
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Decode the JWT token
    const decoded = JSON.parse(atob(token.split('.')[1]));
    
    // Check if user has admin role
    if (decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            } 
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
          </Route>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
