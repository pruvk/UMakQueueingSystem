export default function Dashboard() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
          <span className="text-lg font-semibold">Analytics Card 1</span>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
          <span className="text-lg font-semibold">Analytics Card 2</span>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
          <span className="text-lg font-semibold">Analytics Card 3</span>
        </div>
      </div>
      <div className="min-h-[50vh] flex-1 rounded-xl bg-muted/50 flex items-center justify-center">
        <span className="text-xl font-semibold">Dashboard Main Content Area</span>
      </div>
    </div>
  )
} 