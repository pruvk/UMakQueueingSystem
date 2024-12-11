import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

interface CashierStation {
  id: number
  name: string
  currentNumber: string
  status: 'active' | 'inactive'
}

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

export default function Cashier() {
  const [cashiers, setCashiers] = useState<CashierStation[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [cashierToDelete, setCashierToDelete] = useState<CashierStation | null>(null)

  // Add useEffect to fetch cashiers on component mount
  useEffect(() => { 
    fetchCashiers()
  }, [])

  const fetchCashiers = async () => {
    try {
      const response = await fetch("http://localhost:5272/api/cashier")
      if (response.ok) {
        const data = await response.json()
        setCashiers(data)
      }
    } catch (error) {
      console.error('Error fetching cashiers:', error)
    }
  }

  const handleAddCashier = async () => {
    if (cashiers.length >= 9) {
      alert("Maximum number of cashiers reached")
      return
    }

    const newCashier = {
      name: `Cashier ${cashiers.length + 1}`,
      currentNumber: "0000",
      status: 'active'
    }

    try {
      const response = await fetch("http://localhost:5272/api/cashier", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCashier)
      })

      if (response.ok) {
        await fetchCashiers() // Refresh the list
        setIsAddModalOpen(false)
      }
    } catch (error) {
      console.error('Error adding cashier:', error)
    }
  }

  const handleNext = (cashierId: number) => {
    setCashiers(cashiers.map(cashier => {
      if (cashier.id === cashierId) {
        // Generate next number logic here
        const nextNumber = String(parseInt(cashier.currentNumber) + 1).padStart(4, '0')
        return { ...cashier, currentNumber: nextNumber }
      }
      return cashier
    }))
  }

  const handleDone = (cashierId: number) => {
    // Implement done logic
  }

  const handleCancel = (cashierId: number) => {
    // Implement cancel logic
  }

  const handleSetActive = (cashierId: number) => {
    // Implement active logic
    console.log('Set active:', cashierId)
  }

  const handleSetInactive = (cashierId: number) => {
    // Implement inactive logic
    console.log('Set inactive:', cashierId)
  }

  const handleRemove = (cashierId: number) => {
    const cashier = cashiers.find(c => c.id === cashierId)
    if (cashier) {
      setCashierToDelete(cashier)
      setIsDeleteDialogOpen(true)
    }
  }

  const handleDelete = async () => {
    if (cashierToDelete) {
      try {
        const response = await fetch("http://localhost:5272/api/cashier/${cashierToDelete.id}", {
          method: 'DELETE'
        })

        if (response.ok) {
          await fetchCashiers() // Refresh the list
          setIsDeleteDialogOpen(false)
          setCashierToDelete(null)
        }
      } catch (error) {
        console.error('Error deleting cashier:', error)
      }
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Cashier</h2>
        {cashiers.length < 9 && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Cashier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Cashier</DialogTitle>
                <DialogDescription>
                  Add a new cashier station to the system
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end">
                <Button onClick={handleAddCashier}>
                  Add Cashier
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cashiers.map((cashier) => (
          <div
            key={cashier.id}
            className="p-6 rounded-xl bg-card border shadow-sm"
          >
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{cashier.name}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleSetActive(cashier.id)}>
                      Set Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSetInactive(cashier.id)}>
                      Set Inactive
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleRemove(cashier.id)}
                      className="text-red-600"
                    >
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="space-y-2">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Now Serving</p>
                  <p className="text-2xl font-bold">{cashier.currentNumber}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => handleNext(cashier.id)}
                >
                  Next
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleDone(cashier.id)}
                >
                  Done
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleCancel(cashier.id)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              {cashierToDelete?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}