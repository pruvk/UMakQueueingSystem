import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash, Plus } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Device {
  deviceId: number
  username: string
  deviceName: string
  deviceModel: string
  deviceOwner: string
  deviceType: string
  createdAt: string
}

interface DeviceFormData {
  deviceId?: number
  username: string
  password?: string
  deviceName: string
  deviceModel: string
  deviceOwner: string
  deviceType: string
}

export function DevicesTable() {
  const [devices, setDevices] = useState<Device[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null)
  const [currentDevice, setCurrentDevice] = useState<DeviceFormData>({
    username: "",
    password: "",
    deviceName: "",
    deviceModel: "",
    deviceOwner: "",
    deviceType: "pc"
  })
  const [searchTerm, setSearchTerm] = useState("")

  const fetchDevices = async () => {
    try {
      const response = await fetch("http://localhost:5272/api/devices", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setDevices(data)
      }
    } catch (error) {
      console.error("Error fetching devices:", error)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:5272/api/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(currentDevice)
      })

      if (response.ok) {
        setIsAddModalOpen(false)
        fetchDevices()
        setCurrentDevice({
          username: "",
          password: "",
          deviceName: "",
          deviceModel: "",
          deviceOwner: "",
          deviceType: "pc"
        })
      }
    } catch (error) {
      console.error("Error adding device:", error)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:5272/api/devices/${currentDevice.deviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(currentDevice)
      })

      if (response.ok) {
        setIsEditModalOpen(false)
        fetchDevices()
      }
    } catch (error) {
      console.error("Error updating device:", error)
    }
  }

  const handleDelete = async () => {
    if (!deviceToDelete) return

    try {
      const response = await fetch(`http://localhost:5272/api/devices/${deviceToDelete.deviceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if (response.ok) {
        setIsDeleteDialogOpen(false)
        fetchDevices()
      }
    } catch (error) {
      console.error("Error deleting device:", error)
    }
  }

  const handleDeleteClick = (device: Device) => {
    setDeviceToDelete(device)
    setIsDeleteDialogOpen(true)
  }

  const filteredDevices = devices.filter(device =>
    Object.values(device).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search devices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
              <DialogDescription>
                Add a new device to the system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={currentDevice.username}
                    onChange={(e) => setCurrentDevice({...currentDevice, username: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={currentDevice.password}
                    onChange={(e) => setCurrentDevice({...currentDevice, password: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deviceName">Device Name</Label>
                  <Input
                    id="deviceName"
                    value={currentDevice.deviceName}
                    onChange={(e) => setCurrentDevice({...currentDevice, deviceName: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deviceModel">Device Model</Label>
                  <Input
                    id="deviceModel"
                    value={currentDevice.deviceModel}
                    onChange={(e) => setCurrentDevice({...currentDevice, deviceModel: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deviceOwner">Device Owner</Label>
                  <Input
                    id="deviceOwner"
                    value={currentDevice.deviceOwner}
                    onChange={(e) => setCurrentDevice({...currentDevice, deviceOwner: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deviceType">Device Type</Label>
                  <select
                    id="deviceType"
                    value={currentDevice.deviceType}
                    onChange={(e) => setCurrentDevice({...currentDevice, deviceType: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    required
                  >
                    <option value="pc">PC</option>
                    <option value="laptop">Laptop</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full">Add Device</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Device Name</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDevices.map(device => (
              <TableRow key={device.deviceId}>
                <TableCell className="font-medium">{device.deviceId}</TableCell>
                <TableCell>{device.username}</TableCell>
                <TableCell>{device.deviceName}</TableCell>
                <TableCell>{device.deviceModel}</TableCell>
                <TableCell>{device.deviceOwner}</TableCell>
                <TableCell>{device.deviceType}</TableCell>
                <TableCell>{formatDate(device.createdAt)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => {
                          setCurrentDevice(device)
                          setIsEditModalOpen(true)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteClick(device)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
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

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
            <DialogDescription>
              Make changes to the device information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={currentDevice.username}
                  onChange={(e) => setCurrentDevice({ ...currentDevice, username: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deviceName">Device Name</Label>
                <Input
                  id="deviceName"
                  value={currentDevice.deviceName}
                  onChange={(e) => setCurrentDevice({ ...currentDevice, deviceName: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deviceModel">Device Model</Label>
                <Input
                  id="deviceModel"
                  value={currentDevice.deviceModel}
                  onChange={(e) => setCurrentDevice({ ...currentDevice, deviceModel: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deviceOwner">Device Owner</Label>
                <Input
                  id="deviceOwner"
                  value={currentDevice.deviceOwner}
                  onChange={(e) => setCurrentDevice({ ...currentDevice, deviceOwner: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deviceType">Device Type</Label>
                <select
                  id="deviceType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={currentDevice.deviceType}
                  onChange={(e) => setCurrentDevice({ ...currentDevice, deviceType: e.target.value })}
                  required
                >
                  <option value="pc">PC</option>
                  <option value="laptop">Laptop</option>
                </select>
              </div>
            </div>
            <Button type="submit" className="w-full">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the device
              {deviceToDelete?.deviceName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 