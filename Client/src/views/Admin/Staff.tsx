import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Static data for testing
const users = [
  {
    userId: 1,
    username: "john_doe",
    firstName: "John",
    middleName: "Robert",
    lastName: "Doe",
    role: "staff",
    createdAt: "2024-01-01T00:00:00Z"
  },
  {
    userId: 2,
    username: "jane_smith",
    firstName: "Jane",
    middleName: null,
    lastName: "Smith",
    role: "staff",
    createdAt: "2024-01-02T00:00:00Z"
  },
]

export default function Staff() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null)

  const handleEdit = (user: typeof users[0]) => {
    setSelectedUser(user)
    setEditModalOpen(true)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        
        {/* Create User Modal */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>Add Staff</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Staff</DialogTitle>
              <DialogDescription>
                Create a new staff account. Required fields are marked with an asterisk (*).
              </DialogDescription>
            </DialogHeader>
            <form className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  placeholder="Enter username"
                  className="w-full"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  className="w-full"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  className="w-full"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="middleName">
                  Middle Name <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="middleName"
                  placeholder="Enter middle name"
                  className="w-full"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  className="w-full"
                />
              </div>
            </form>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Staff</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
              <DialogDescription>
                Update staff member information. Required fields are marked with an asterisk (*).
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <form className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-username">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-username"
                    defaultValue={selectedUser.username}
                    className="w-full"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-firstName"
                    defaultValue={selectedUser.firstName}
                    className="w-full"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-middleName">
                    Middle Name <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="edit-middleName"
                    defaultValue={selectedUser.middleName || ''}
                    className="w-full"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-lastName">
                    Last Name <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="edit-lastName"
                    defaultValue={selectedUser.lastName || ''}
                    className="w-full"
                  />
                </div>
              </form>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Middle Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.userId}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.middleName || "-"}</TableCell>
                <TableCell>{user.lastName || "-"}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleEdit(user)}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 