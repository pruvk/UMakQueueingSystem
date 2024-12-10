import { useEffect, useState } from "react"
import { StaffsTable } from "@/components/staffs-table"

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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('No token found - user needs to login')
      return
    }

    const fetchStaffs = async () => {
      try {
        const response = await fetch('http://localhost:5272/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) throw new Error('Failed to fetch staffs')
        const data = await response.json()
        setStaffs(data)
      } catch (error) {
        console.error('Error fetching staffs:', error)
      }
    }

    fetchStaffs()
  }, [])

  const handleEdit = async (staffData: {
    username: string
    firstName: string
    middleName?: string
    lastName?: string
  }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5272/api/users/${staffData.username}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffData),
      })

      if (!response.ok) {
        throw new Error('Failed to update staff member')
      }

      // Refresh the staff list
      const updatedResponse = await fetch('http://localhost:5272/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      if (!updatedResponse.ok) {
        throw new Error('Failed to fetch updated staff list')
      }
      
      const updatedData = await updatedResponse.json()
      setStaffs(updatedData)
    } catch (error) {
      console.error('Error updating staff:', error)
      setError('Failed to update staff member')
    }
  }

  const handleDelete = async (staff: Staff) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5272/api/users/${staff.userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete staff member')
      }

      // Update the local state to remove the deleted staff
      setStaffs(staffs.filter(s => s.userId !== staff.userId))
    } catch (error) {
      console.error('Error deleting staff:', error)
      setError('Failed to delete staff member')
    }
  }

  const handleAddStaff = async (staffData: {
    username: string
    password: string
    firstName: string
    middleName?: string
    lastName?: string
  }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5272/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...staffData,
          role: 'staff' // Set role as staff
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create staff member')
      }

      // Fetch updated staff list
      const updatedResponse = await fetch('http://localhost:5272/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      if (!updatedResponse.ok) {
        throw new Error('Failed to fetch updated staff list')
      }
      
      const updatedData = await updatedResponse.json()
      setStaffs(updatedData)
    } catch (error) {
      console.error('Error adding staff:', error)
      setError('Failed to add staff member')
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
        <p className="text-muted-foreground">
          Manage your staff members here
        </p>
      </div>

      <StaffsTable
        data={staffs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAddStaff}
      />

      {/* ... existing AlertDialog ... */}
    </div>
  )
}