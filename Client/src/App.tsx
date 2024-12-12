import { useEffect } from 'react'
import './index.css'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ThemeProvider } from "@/components/theme-provider"
import AdminLayout from './views/Admin/AdminPage'
import Login from './views/Login'
import StaffManagement from './views/Admin/Staffs'
import Dashboard from './views/Admin/Dashboard'
import DeviceManagement from './views/Admin/Devices'
import StaffLayout from './views/Staff/StaffPage'
import Cashier from './views/Staff/Cashier'
import Queue from './views/Staff/Queue'
import Inventory from './views/Staff/Inventory'

import DeviceLayout from './views/Device/Catalog'
// Protected Route components
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

const ProtectedStaffRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Decode the JWT token
    const decoded = JSON.parse(atob(token.split('.')[1]));
    
    // Check if user has staff role
    if (decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] !== 'staff') {
      navigate('/login');
    }
  }, [navigate]);

  return <>{children}</>;
};

const ProtectedDeviceRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Decode the JWT token
    const decoded = JSON.parse(atob(token.split('.')[1]));
    
    // Check if it's a device token
    if (decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] !== 'device') {
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
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>} />
          
          {/* Staff Routes */}
          <Route path="/staff/*" element={<ProtectedStaffRoute><StaffLayout /></ProtectedStaffRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="cashier" element={<Cashier />} />
            <Route path="queue" element={<Queue />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="" element={<Navigate to="/staff/dashboard" replace />} />
          </Route>
          
          {/* Device Routes */}
          <Route path="/device/*" element={<ProtectedDeviceRoute><DeviceLayout /></ProtectedDeviceRoute>} />
          

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
