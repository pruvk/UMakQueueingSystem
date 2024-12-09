import { UsersTable } from "@/components/users/users-table"

export default function UsersPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <p className="text-muted-foreground">Manage system users and their roles</p>
      </div>
      <UsersTable />
    </div>
  )
} 