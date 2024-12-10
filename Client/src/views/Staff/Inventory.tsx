export default function Inventory() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Inventory Management</h1>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
          <span className="text-lg font-semibold">Total Items</span>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
          <span className="text-lg font-semibold">Low Stock Items</span>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
          <span className="text-lg font-semibold">Recent Updates</span>
        </div>
      </div>
      <div className="min-h-[50vh] flex-1 rounded-xl bg-muted/50 flex flex-col items-center justify-center gap-4">
        <span className="text-xl font-semibold">Inventory Items List</span>
        <div className="w-full max-w-4xl p-4">
          <div className="grid gap-4">
            <div className="rounded-lg bg-background/50 p-4">
              <h3 className="font-medium mb-2">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="p-3 rounded bg-primary/10 text-center">Add Item</div>
                <div className="p-3 rounded bg-primary/10 text-center">Update Stock</div>
                <div className="p-3 rounded bg-primary/10 text-center">Generate Report</div>
                <div className="p-3 rounded bg-primary/10 text-center">Search Items</div>
              </div>
            </div>
            
            <div className="rounded-lg bg-background/50 p-4">
              <h3 className="font-medium mb-2">Recent Activity</h3>
              <div className="space-y-2">
                <div className="p-2 rounded bg-primary/5">Stock update - Item #1234</div>
                <div className="p-2 rounded bg-primary/5">New item added - Item #5678</div>
                <div className="p-2 rounded bg-primary/5">Low stock alert - Item #9012</div>
              </div>
            </div>
            
            <div className="rounded-lg bg-background/50 p-4">
              <h3 className="font-medium mb-2">Categories Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div className="p-2 rounded bg-primary/5">Category 1</div>
                <div className="p-2 rounded bg-primary/5">Category 2</div>
                <div className="p-2 rounded bg-primary/5">Category 3</div>
                <div className="p-2 rounded bg-primary/5">Category 4</div>
                <div className="p-2 rounded bg-primary/5">Category 5</div>
                <div className="p-2 rounded bg-primary/5">Category 6</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 