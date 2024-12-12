import { Route, Routes, useLocation } from 'react-router-dom'
import { StaffSidebar } from "@/components/staff-sidebar"
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
import Cashier from './Cashier'
import Display from './Display'
import Inventory from './Inventory'

export default function StaffLayout() {
  const location = useLocation()
  const currentPath = location.pathname.split('/').pop()
  
  const getBreadcrumbTitle = () => {
    switch(currentPath) {
      case 'dashboard': return 'Dashboard'
      case 'cashier': return 'Cashier'
      case 'display': return 'Display'
      case 'inventory': return 'Inventory Management'
      default: return 'Dashboard'
    }
  }

  return (
    <SidebarProvider>
      <StaffSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/staff">Staff Controls</BreadcrumbLink>
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
          <Route path="cashier" element={<Cashier />} />
          <Route path="display" element={<Display />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </SidebarInset>
    </SidebarProvider>
  )
}