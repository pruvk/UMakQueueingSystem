import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, Package, History, Download } from "lucide-react"
import { reportService } from "@/services/reportService"
import { useToast } from "@/hooks/use-toast"

export default function Reports() {
  const { toast } = useToast()

  const reports = [
    {
      title: "Staff Report",
      description: "Generate a detailed report of all staff members including their roles and status",
      icon: <Users className="h-8 w-8" />,
      type: "staff",
      onClick: async () => {
        try {
          await reportService.generateStaffReport()
          toast({
            title: "Success",
            description: "Staff report generated successfully",
          })
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to generate staff report",
            variant: "destructive",
          })
        }
      }
    },
    {
      title: "Device Report",
      description: "Generate a report of all registered devices and their current status",
      icon: <FileText className="h-8 w-8" />,
      type: "devices",
      onClick: async () => {
        try {
          await reportService.generateDeviceReport()
          toast({
            title: "Success",
            description: "Device report generated successfully",
          })
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to generate device report",
            variant: "destructive",
          })
        }
      }
    },
    {
      title: "Inventory Report",
      description: "Generate a comprehensive report of all products and their current stock levels",
      icon: <Package className="h-8 w-8" />,
      type: "inventory",
      onClick: async () => {
        try {
          await reportService.generateInventoryReport()
          toast({
            title: "Success",
            description: "Inventory report generated successfully",
          })
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to generate inventory report",
            variant: "destructive",
          })
        }
      }
    },
    {
      title: "Transaction Report",
      description: "Generate a report of all transactions within a specified date range",
      icon: <History className="h-8 w-8" />,
      type: "transactions",
      onClick: async () => {
        try {
          await reportService.generateTransactionReport()
          toast({
            title: "Success",
            description: "Transaction report generated successfully",
          })
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to generate transaction report",
            variant: "destructive",
          })
        }
      }
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Report Generation</h2>
        <p className="text-muted-foreground">
          Generate various reports in PDF format
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">{report.title}</CardTitle>
              {report.icon}
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-md">
                {report.description}
              </CardDescription>
              <Button 
                className="w-full" 
                size="lg"
                onClick={report.onClick}
              >
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 