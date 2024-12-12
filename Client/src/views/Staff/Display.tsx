import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Display() {
  return (
    <div className="h-screen flex flex-col p-8 bg-background">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold tracking-tight">UMak Coop Queueing System</h2>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-12">
        {/* In Queue Column */}
        <div className="flex flex-col bg-muted/30 rounded-2xl p-8">
          <h3 className="text-3xl font-semibold text-center mb-8">
            <span className="bg-primary/10 text-primary px-6 py-2 rounded-full">In Queue</span>
          </h3>
          <div className="flex-1 grid grid-rows-3 gap-8">
            <div className="relative overflow-hidden rounded-xl bg-background p-8 border-2 border-primary/20">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="text-2xl font-semibold text-primary">Cashier 1</div>
                  <div className="text-sm text-muted-foreground">Next in line</div>
                </div>
                <div className="text-7xl font-bold text-primary tabular-nums">0001</div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-background p-8 border-2 border-primary/20">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="text-2xl font-semibold text-primary">Cashier 2</div>
                  <div className="text-sm text-muted-foreground">Next in line</div>
                </div>
                <div className="text-7xl font-bold text-primary tabular-nums">0002</div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-background p-8 border-2 border-primary/20">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="text-2xl font-semibold text-primary">Cashier 3</div>
                  <div className="text-sm text-muted-foreground">Next in line</div>
                </div>
                <div className="text-7xl font-bold text-primary tabular-nums">0003</div>
              </div>
            </div>
          </div>
        </div>

        {/* Now Serving Column */}
        <div className="flex flex-col bg-muted/30 rounded-2xl p-8">
          <h3 className="text-3xl font-semibold text-center mb-8">
            <span className="bg-green-500/10 text-green-500 px-6 py-2 rounded-full">Now Serving</span>
          </h3>
          <div className="flex-1 grid grid-rows-3 gap-8">
            <div className="relative overflow-hidden rounded-xl bg-background p-8 border-2 border-green-500/20">
              <div className="absolute top-0 left-0 w-2 h-full bg-green-500" />
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="text-2xl font-semibold text-green-500">Cashier 1</div>
                  <div className="text-sm text-muted-foreground">Currently serving</div>
                </div>
                <div className="text-7xl font-bold text-green-500 tabular-nums">0000</div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-background p-8 border-2 border-green-500/20">
              <div className="absolute top-0 left-0 w-2 h-full bg-green-500" />
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="text-2xl font-semibold text-green-500">Cashier 2</div>
                  <div className="text-sm text-muted-foreground">Currently serving</div>
                </div>
                <div className="text-7xl font-bold text-green-500 tabular-nums">0000</div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-background p-8 border-2 border-green-500/20">
              <div className="absolute top-0 left-0 w-2 h-full bg-green-500" />
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="text-2xl font-semibold text-green-500">Cashier 3</div>
                  <div className="text-sm text-muted-foreground">Currently serving</div>
                </div>
                <div className="text-7xl font-bold text-green-500 tabular-nums">0000</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}