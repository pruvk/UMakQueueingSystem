import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Cashier() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Cashier</h2>
      </div>
      <div className="min-h-[80vh] rounded-xl bg-muted/50 flex flex-col items-center justify-center gap-4">
        <span className="text-xl font-semibold">Cashier Workspace</span>
        <p className="text-muted-foreground">Process transactions and manage payments</p>
        <div className="grid grid-cols-2 gap-4 p-4">
          <div className="p-4 rounded-lg bg-background/50">
            <h3 className="font-medium">Current Transaction</h3>
          </div>
          <div className="p-4 rounded-lg bg-background/50">
            <h3 className="font-medium">Transaction History</h3>
          </div>
        </div>
      </div>
    </div>
  )
}