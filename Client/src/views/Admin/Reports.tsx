export default function Reports() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Report Generation</h1>
      <div className="min-h-[80vh] rounded-xl bg-muted/50 flex flex-col items-center justify-center gap-4">
        <span className="text-xl font-semibold">Reports Page</span>
        <p className="text-muted-foreground">Generate and view system reports here</p>
        <div className="grid grid-cols-2 gap-4 p-4">
          <div className="p-4 rounded-lg bg-background/50">
            <h3 className="font-medium">Monthly Reports</h3>
          </div>
          <div className="p-4 rounded-lg bg-background/50">
            <h3 className="font-medium">Annual Reports</h3>
          </div>
        </div>
      </div>
    </div>
  )
} 