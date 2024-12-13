import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, ListOrdered, ArrowUpRight } from "lucide-react"
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer 
} from 'recharts'
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface DashboardStats {
  queueLength: number
  activeCashiers: number
  totalCashiers: number
  todayTransactions: number
  queueStatus: QueueStatus
  salesDistribution: SalesDistribution
}

interface QueueStatus {
  waiting: number
  serving: number
  completed: number
  cancelled: number
}

interface SalesDistribution {
  books: number
  uniforms: number
  schoolSupplies: number
}

// Add new interfaces for chart data
interface TransactionTrend {
  hour: string
  count: number
}

interface ServiceTimeData {
  cashier: string
  averageTime: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  error?: string
  data: T
}

// Update the color constants to match your theme
const CHART_COLORS = {
  // Light theme colors
  primary: "hsl(38 100% 50%)",      // --primary
  secondary: "hsl(25 100% 45%)",     // --secondary
  accent: "hsl(39 100% 60%)",        // --accent
  muted: "hsl(35 100% 80%)",         // --muted
  chart1: "hsl(38 100% 60%)",        // --chart-1
  chart2: "hsl(25 100% 55%)",        // --chart-2
  chart3: "hsl(39 100% 70%)",        // --chart-3
  chart4: "hsl(0 0% 70%)",           // --chart-4
  chart5: "hsl(30 40% 50%)",         // --chart-5

  // Status colors
  waiting: "hsl(38 100% 45%)",       // primary
  serving: "hsl(25 100% 60%)",       // secondary
  completed: "hsl(39 100% 70%)",     // accent
  cancelled: "hsl(0 0% 50%)"         // muted
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    queueLength: 0,
    activeCashiers: 0,
    totalCashiers: 9,
    todayTransactions: 0,
    queueStatus: {
      waiting: 0,
      serving: 0,
      completed: 0,
      cancelled: 0
    },
    salesDistribution: {
      books: 0,
      uniforms: 0,
      schoolSupplies: 0
    }
  })

  // Add state for chart data
  const [transactionTrends, setTransactionTrends] = useState<TransactionTrend[]>([])
  const [serviceTimeData, setServiceTimeData] = useState<ServiceTimeData[]>([])

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

  // Sample data - replace with real data later
  const chartdata = [
    {
      hour: "9AM",
      "Transactions": 4,
    },
    {
      hour: "10AM",
      "Transactions": 7,
    },
    {
      hour: "11AM",
      "Transactions": 12,
    },
    {
      hour: "12PM",
      "Transactions": 8,
    },
    {
      hour: "1PM",
      "Transactions": 5,
    },
    {
      hour: "2PM",
      "Transactions": 9,
    },
    {
      hour: "3PM",
      "Transactions": 11,
    },
    {
      hour: "4PM",
      "Transactions": 6,
    },
  ]

  const serviceData = [
    {
      name: "Cashier 1",
      "Average Time": 5.2,
    },
    {
      name: "Cashier 2",
      "Average Time": 4.8,
    },
    {
      name: "Cashier 3",
      "Average Time": 6.1,
    },
    {
      name: "Cashier 4",
      "Average Time": 5.5,
    },
  ]

  const queueStatusData = [
    { status: "Waiting", value: stats.queueStatus.waiting },
    { status: "Serving", value: stats.queueStatus.serving },
    { status: "Completed", value: stats.queueStatus.completed },
    { status: "Cancelled", value: stats.queueStatus.cancelled },
  ]

  const salesData = [
    { name: "Books", value: stats.salesDistribution.books },
    { name: "Uniforms", value: stats.salesDistribution.uniforms },
    { name: "School Supplies", value: stats.salesDistribution.schoolSupplies },
  ]

  const totalItems = salesData.reduce((sum, item) => sum + item.value, 0)

  // Update the stats array colors
  const statsConfig = [
    {
      title: "Current Queue Length",
      value: stats.queueLength,
      icon: ListOrdered,
      subtitle: "Customers in queue",
      color: CHART_COLORS.primary,
      bgColor: "bg-primary/10"
    },
    {
      title: "Active Cashiers",
      value: `${stats.activeCashiers}/${stats.totalCashiers}`,
      icon: Users,
      subtitle: `${Math.round((stats.activeCashiers/stats.totalCashiers) * 100)}% capacity`,
      color: CHART_COLORS.secondary,
      bgColor: "bg-secondary/10",
      progress: (stats.activeCashiers/stats.totalCashiers) * 100,
      progressColor: "bg-secondary"
    },
    {
      title: "Completed Transactions",
      value: stats.todayTransactions,
      icon: ArrowUpRight,
      subtitle: `${Math.round((stats.queueStatus.completed / (stats.queueStatus.completed + stats.queueStatus.cancelled)) * 100)}% completion rate`,
      color: CHART_COLORS.accent,
      bgColor: "bg-accent/10",
      trend: "up",
      trendColor: "text-accent"
    }
  ]

  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Overview of your store's performance
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statsConfig.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  stat.bgColor
                )}>
                  <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="text-3xl font-bold">{stat.value}</div>
                  {stat.progress ? (
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-secondary/20">
                        <motion.div 
                          className="h-full rounded-full"
                          style={{ backgroundColor: stat.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {stat.subtitle}
                      </span>
                    </div>
                  ) : stat.trend ? (
                    <div className={cn("flex items-center gap-2", stat.trendColor)}>
                      <ArrowUpRight className="h-4 w-4" />
                      <p className="text-sm">{stat.subtitle}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section - Keep the same but add animations */}
      <div className="grid gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-colors h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Sales Distribution</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Product Category Sales
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      <Cell fill={CHART_COLORS.chart1} />
                      <Cell fill={CHART_COLORS.chart2} />
                      <Cell fill={CHART_COLORS.chart3} />
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        return (
                          <div className="rounded-lg border bg-card p-2 shadow-md">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {payload[0].name}
                              </span>
                              <span className="text-lg font-bold">
                                {((payload[0].value as number)/totalItems * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-8 flex justify-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full" style={{ background: CHART_COLORS.chart1 }} />
                  <span className="text-sm">Books</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full" style={{ background: CHART_COLORS.chart2 }} />
                  <span className="text-sm">Uniforms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full" style={{ background: CHART_COLORS.chart3 }} />
                  <span className="text-sm">School Supplies</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-colors h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Queue Status</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Distribution across statuses
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={queueStatusData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <XAxis 
                      dataKey="status" 
                      tick={{ fill: 'currentColor' }}
                      axisLine={{ stroke: 'currentColor' }}
                    />
                    <YAxis 
                      tick={{ fill: 'currentColor' }}
                      axisLine={{ stroke: 'currentColor' }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill={CHART_COLORS.waiting}
                      radius={[4, 4, 0, 0]}
                    >
                      {queueStatusData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={
                            entry.status === "Waiting" ? CHART_COLORS.waiting :
                            entry.status === "Serving" ? CHART_COLORS.serving :
                            entry.status === "Completed" ? CHART_COLORS.completed :
                            CHART_COLORS.cancelled
                          }
                        />
                      ))}
                    </Bar>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        return (
                          <div className="rounded-lg border bg-card p-2 shadow-md">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {payload[0].payload.status}
                              </span>
                              <span className="text-lg font-bold">
                                {payload[0].value}
                              </span>
                            </div>
                          </div>
                        )
                      }}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 