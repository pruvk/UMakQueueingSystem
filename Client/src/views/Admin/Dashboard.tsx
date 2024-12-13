import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, ListOrdered, ArrowUpRight } from "lucide-react"

interface DashboardStats {
  queueLength: number
  activeCashiers: number
  totalCashiers: number
  todayTransactions: number
  averageServiceTime: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  error?: string
  data: T
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    queueLength: 0,
    activeCashiers: 0,
    totalCashiers: 9,
    todayTransactions: 0,
    averageServiceTime: 0
  })

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("http://localhost:5272/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      
      const result: ApiResponse<DashboardStats> = await response.json()
      
      if (response.ok && result.success) {
        setStats(result.data)
      } else {
        console.error("Failed to fetch stats:", result.message)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (minutes: number) => {
    if (minutes < 1) return "< 1 min"
    if (minutes < 60) return `${Math.round(minutes)} mins`
    const hours = Math.floor(minutes / 60)
    const remainingMins = Math.round(minutes % 60)
    return `${hours}h ${remainingMins}m`
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Queue Length Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Queue</CardTitle>
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats.queueLength}</div>
              <span className="text-xs text-muted-foreground">customers waiting</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Cashiers Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cashiers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {stats.activeCashiers}/{stats.totalCashiers}
              </div>
              <span className="text-xs text-muted-foreground">stations open</span>
            </div>
          </CardContent>
        </Card>

        {/* Today's Transactions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Transactions</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats.todayTransactions}</div>
              <span className="text-xs text-muted-foreground">processed today</span>
            </div>
          </CardContent>
        </Card>

        {/* Average Service Time Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Service Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{formatTime(stats.averageServiceTime)}</div>
              <span className="text-xs text-muted-foreground">per transaction</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="min-h-[50vh] flex-1 rounded-xl bg-muted/50 flex items-center justify-center">
        <span className="text-xl font-semibold">Dashboard Main Content Area</span>
      </div>
    </div>
  )
} 