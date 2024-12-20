import { Route, Routes, useLocation } from 'react-router-dom'
import { AppSidebar } from "@/components/admin-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Dashboard from './Dashboard'
import Reports from './Reports'
import StaffManagement from './Staffs'
import DeviceManagement from './Devices'
import Transactions from './Transactions'
export default function AdminLayout() {
  const location = useLocation()
  const currentPath = location.pathname.split('/').pop()
  
  const getBreadcrumbTitle = () => {
    switch(currentPath) {
      case 'dashboard': return 'Dashboard'
      case 'reports': return 'Report Generation'
      case 'staffs': return 'Staff Management' 
      case 'devices': return 'Device Management'
      case 'transactions': return 'Transaction History'
      default: return 'Dashboard'
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Admin Controls</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{getBreadcrumbTitle()}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="staffs" element={<StaffManagement />} />
          <Route path="devices" element={<DeviceManagement />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </SidebarInset>
    </SidebarProvider>
  )
}
