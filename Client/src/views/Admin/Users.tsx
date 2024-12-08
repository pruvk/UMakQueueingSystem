export default function Users() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">User Management</h1>
      <div className="min-h-[80vh] rounded-xl bg-muted/50 flex flex-col items-center justify-center gap-4">
        <span className="text-xl font-semibold">User Management Page</span>
        <p className="text-muted-foreground">Manage system users and permissions here</p>
        <div className="grid grid-cols-2 gap-4 p-4">
          <div className="p-4 rounded-lg bg-background/50">
            <h3 className="font-medium">Active Users</h3>
            <p className="text-sm text-muted-foreground">View and manage active users</p>
          </div>
          <div className="p-4 rounded-lg bg-background/50">
            <h3 className="font-medium">User Roles</h3>
            <p className="text-sm text-muted-foreground">Configure user roles and permissions</p>
          </div>
        </div>
      </div>
    </div>
  )
} 