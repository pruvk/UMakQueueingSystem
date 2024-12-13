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
import Inventory from './views/Staff/Inventory'
import Checkout from './views/Device/Checkout'
import Cart from './views/Device/Cart'

import DeviceLayout from './views/Device/Catalog'
import { CartProvider } from "@/contexts/CartContext"
import { Toaster } from "@/components/ui/toaster"
import Display from './views/Staff/Display'
import QueueConfirmation from "@/views/Device/QueueConfirmation"
import Transactions from './views/Admin/Transactions'
import Reports from './views/Admin/Reports'

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
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="reports" element={<Reports />} />
              <Route path="staffs" element={<StaffManagement />} />
              <Route path="devices" element={<DeviceManagement />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
            
            {/* Staff Routes */}
            <Route path="/staff/*" element={<ProtectedStaffRoute><StaffLayout /></ProtectedStaffRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="cashier" element={<Cashier />} />
              <Route path="display" element={<Display />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="" element={<Navigate to="/staff/dashboard" replace />} />
            </Route>
            
            {/* Device Routes - Order matters! */}
            <Route path="/device/queue-confirmation" element={
              <ProtectedDeviceRoute>
                <QueueConfirmation />
              </ProtectedDeviceRoute>
            } />
            <Route path="/device/checkout" element={
              <ProtectedDeviceRoute>
                <Checkout />
              </ProtectedDeviceRoute>
            } />
            <Route path="/device/cart" element={
              <ProtectedDeviceRoute>
                <Cart />
              </ProtectedDeviceRoute>
            } />
            {/* This catch-all route must be last */}
            <Route path="/device/*" element={
              <ProtectedDeviceRoute>
                <DeviceLayout />
              </ProtectedDeviceRoute>
            } />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster />
        </Router>
      </CartProvider>
    </ThemeProvider>
  )
}

export default App
