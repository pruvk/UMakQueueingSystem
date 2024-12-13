import { useState, useEffect } from "react"
import { StaffsTable } from "@/components/staffs-table"
import { useToast } from "@/hooks/use-toast"

interface Staff {
  userId: number
  username: string
  firstName: string
  middleName?: string
  lastName?: string
  role: string
  status: string
  createdAt: string
}

export default function StaffManagement() {
  const [staffs, setStaffs] = useState<Staff[]>([])
  const { toast } = useToast()

  const fetchStaffs = async () => {
    try {
      const response = await fetch("http://localhost:5272/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setStaffs(data)
      }
    } catch (error) {
      console.error("Error fetching staffs:", error)
    }
  }

  useEffect(() => {
    fetchStaffs()
  }, [])

  const handleEdit = async (staff: {
    userId: number
    username: string
    firstName: string
    middleName?: string
    lastName?: string
  }) => {
    try {
      const response = await fetch(`http://localhost:5272/api/users/${staff.userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          firstName: staff.firstName,
          middleName: staff.middleName,
          lastName: staff.lastName
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update staff")
      }

      await fetchStaffs()
      toast({
        title: "Success",
        description: "Staff updated successfully",
      })
    } catch (error) {
      console.error("Error updating staff:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update staff",
      })
    }
  }

  const handleDelete = async (staff: Staff) => {
    try {
      const response = await fetch(`http://localhost:5272/api/users/${staff.userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to delete staff")
      }

      await fetchStaffs()
      toast({
        title: "Success",
        description: "Staff deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting staff:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete staff",
      })
    }
  }

  const handleAdd = async (staffData: {
    username: string
    password: string
    firstName: string
    middleName?: string
    lastName?: string
  }) => {
    try {
      const response = await fetch("http://localhost:5272/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(staffData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData || "Failed to add staff")
      }

      await fetchStaffs()
      toast({
        title: "Success",
        description: "Staff added successfully",
      })
    } catch (error) {
      console.error("Error adding staff:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add staff",
      })
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <StaffsTable
          data={staffs}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      </div>
    </div>
  )
}