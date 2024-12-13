import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"
import { type ToastProps } from "@/components/ui/toast"

interface Queue {
  queueNumber: string
  orderId: number
  status: string
  cashierId: number | null
  createdAt: string
  calledAt: string | null
  completedAt: string | null
  order: {
    customerInfo: {
      name: string
      studentId: string
      contactNumber: string
      professor: string
    }
    total: number
  }
}

export default function QueueManagement() {
  const [queues, setQueues] = useState<Queue[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast() as { toast: (props: ToastProps) => void }

  const fetchQueues = async () => {
    try {
      const response = await fetch("http://localhost:5272/api/queue", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setQueues(data)
      }
    } catch (error) {
      console.error("Error fetching queues:", error)
    }
  }

  useEffect(() => {
    fetchQueues()
    const interval = setInterval(fetchQueues, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const handleUpdateStatus = async (queueId: number, status: string) => {
    try {
      const response = await fetch(`http://localhost:5272/api/queue/${queueId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(status)
      })

      if (response.ok) {
        fetchQueues()
        toast({
          title: "Status Updated",
          content: `Queue status changed to ${status}`,
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const filteredQueues = queues.filter(queue =>
    queue.queueNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    queue.order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting": return "bg-yellow-500"
      case "serving": return "bg-blue-500"
      case "completed": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Queue Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by queue number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Queue #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQueues.map((queue) => (
                <TableRow key={queue.queueNumber}>
                  <TableCell className="font-medium">{queue.queueNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{queue.order.customerInfo.name}</p>
                      <p className="text-sm text-muted-foreground">{queue.order.customerInfo.studentId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(queue.status)}>
                      {queue.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(queue.createdAt)}</TableCell>
                  <TableCell>
                    {queue.status === "waiting" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(parseInt(queue.queueNumber.slice(1)), "serving")}
                      >
                        Call
                      </Button>
                    )}
                    {queue.status === "serving" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(parseInt(queue.queueNumber.slice(1)), "completed")}
                      >
                        Complete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 