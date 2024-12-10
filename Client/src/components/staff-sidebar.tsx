import * as React from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { LayoutDashboard, Building2, LogOut, CreditCard, Users, Package } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

const data = {
  navMain: [
    {
      title: "Staff Controls",
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "/staff/dashboard",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          title: "Queue Management",
          url: "/staff/queue",
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: "Cashier",
          url: "/staff/cashier",
          icon: <CreditCard className="h-4 w-4" />,
        },
        {
          title: "Inventory Management",
          url: "/staff/inventory",
          icon: <Package className="h-4 w-4" />,
        },
      ],
    },
  ],
}

export function StaffSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <Sidebar {...props}>
      <SidebarContent className="flex flex-col h-full">
        <SidebarHeader className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary p-2">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-base font-semibold">UMak Coop Queueing System</span>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
                        {item.icon}
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <div className="mt-auto p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleLogout}
              className="flex-1"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
            <ModeToggle />
          </div>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}