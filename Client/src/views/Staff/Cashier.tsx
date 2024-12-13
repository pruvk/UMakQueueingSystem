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
import { cn } from "@/lib/utils"

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

// Add a new interface for API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Add this interface near the top with other interfaces
interface QueueNumber {
  id: number;
  queueNumber: string;
  status: 'waiting' | 'serving' | 'completed' | 'cancelled';
  timestamp: string;
}

export default function Cashier() {
  const [cashiers, setCashiers] = useState<CashierStation[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [cashierToDelete, setCashierToDelete] = useState<CashierStation | null>(null)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [queueToCancel, setQueueToCancel] = useState<{
    cashierId: number, 
    queueNumber: string,
    queueId: number
  } | null>(null);

  // Add useEffect to fetch cashiers on component mount
  useEffect(() => { 
    fetchCashiers()
  }, [])

  const fetchCashiers = async () => {
    try {
        const response = await fetch('http://localhost:5272/api/cashier', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched cashiers:', data);
        setCashiers(data);
    } catch (error) {
        console.error('Error fetching cashiers:', error);
    }
  }

  const handleAddCashier = async () => {
    if (cashiers.length >= 9) {
      alert("Maximum number of cashiers reached");
      return;
    }

    // Find the next available number by checking existing cashier names
    const existingNumbers = cashiers.map(c => {
      const match = c.name.match(/\d+/)
      return match ? parseInt(match[0]) : 0
    })
    
    // Find the first missing number in sequence
    let nextNumber = 1
    while (existingNumbers.includes(nextNumber)) {
      nextNumber++
    }

    const newCashier = {
      name: `Cashier ${nextNumber}`,
      currentNumber: "0000",
      status: 'active'
    }

    try {
        const response = await fetch("http://localhost:5272/api/cashier", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(newCashier)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        await fetchCashiers();
        setIsAddModalOpen(false);
    } catch (error) {
        console.error('Error adding cashier:', error);
    }
  }

  const handleNext = async (cashierId: number) => {
    try {
        // First check if cashier exists and is active
        const cashier = cashiers.find(c => c.id === cashierId);
        if (!cashier) {
            alert("Cashier not found");
            return;
        }

        console.log('Cashier found:', cashier);

        // Use the cashier's actual Id instead of CashierId
        const response = await fetch(`http://localhost:5272/api/cashier/queue/next/${cashier.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('Response status:', response.status);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to get next customer");
        }

        if (!data.success) {
            alert(data.message || "No customers waiting in line");
            return;
        }

        await fetchCashiers();
    } catch (error) {
        console.error('Error getting next customer:', error);
        alert(error instanceof Error ? error.message : "Error getting next customer");
    }
  }

  const handleDone = async (cashierId: number) => {
    try {
        const cashier = cashiers.find(c => c.id === cashierId);
        if (!cashier || cashier.currentNumber === "0000") {
            alert("No active queue to complete");
            return;
        }

        const response = await fetch(`http://localhost:5272/api/Queue/${cashier.currentNumber}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to complete queue");
        }

        await fetchCashiers(); // Refresh cashier list
    } catch (error) {
        console.error('Error completing service:', error);
        alert("Error completing service: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }

  const handleCancel = async (cashierId: number) => {
    const cashier = cashiers.find(c => c.id === cashierId);
    if (!cashier || cashier.currentNumber === "0000") {
        alert("No active queue to cancel");
        return;
    }

    setQueueToCancel({ 
        cashierId, 
        queueNumber: cashier.currentNumber,
        queueId: 0  // We don't need the actual ID since we'll use queue number
    });
    setIsCancelDialogOpen(true);
  }

  const confirmCancel = async () => {
    if (!queueToCancel) return;

    try {
        const response = await fetch(`http://localhost:5272/api/queue/${queueToCancel.queueNumber}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to cancel queue");
        }

        await fetchCashiers();
    } catch (error) {
        console.error('Error cancelling queue:', error);
        alert("Error cancelling queue: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
        setIsCancelDialogOpen(false);
        setQueueToCancel(null);
    }
  }

  const handleSetActive = async (cashierId: number) => {
    try {
      const response = await fetch(`http://localhost:5272/api/cashier/${cashierId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'active' })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchCashiers();
    } catch (error) {
      console.error('Error setting cashier active:', error);
      alert("Error updating cashier status");
    }
  }

  const handleSetInactive = async (cashierId: number) => {
    try {
      const response = await fetch(`http://localhost:5272/api/cashier/${cashierId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'inactive' })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchCashiers();
    } catch (error) {
      console.error('Error setting cashier inactive:', error);
      alert("Error updating cashier status");
    }
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
        const response = await fetch(`http://localhost:5272/api/cashier/${cashierToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete cashier');
        }

        await fetchCashiers();
        setIsDeleteDialogOpen(false);
        setCashierToDelete(null);
      } catch (error) {
        console.error('Error deleting cashier:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete cashier');
      }
    }
  };

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
        {cashiers
          .sort((a, b) => {
            // Extract numbers from cashier names
            const aNum = parseInt(a.name.match(/\d+/)?.[0] || '0');
            const bNum = parseInt(b.name.match(/\d+/)?.[0] || '0');
            
            // Special case for Cashier 1
            if (aNum === 1) return -1;
            if (bNum === 1) return 1;
            
            // Normal numerical sorting for other cashiers
            return aNum - bNum;
          })
          .map((cashier) => (
            <div
              key={cashier.id}
              className={cn(
                "p-6 rounded-xl border shadow-sm",
                cashier.status === 'inactive' ? 'opacity-50' : '',
                "bg-card"
              )}
            >
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{cashier.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Status: {cashier.status === 'active' ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {cashier.status === 'inactive' ? (
                        <DropdownMenuItem onClick={() => handleSetActive(cashier.id)}>
                          Set Active
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleSetInactive(cashier.id)}>
                          Set Inactive
                        </DropdownMenuItem>
                      )}
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
                    disabled={cashier.status === 'inactive'}
                  >
                    Next
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleDone(cashier.id)}
                    disabled={cashier.status === 'inactive' || cashier.currentNumber === '0000'}
                  >
                    Complete
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleCancel(cashier.id)}
                    disabled={cashier.status === 'inactive' || cashier.currentNumber === '0000'}
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

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Cancel Queue</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to cancel queue number {queueToCancel?.queueNumber}? 
                    This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={confirmCancel}
                    className="bg-red-600 hover:bg-red-700"
                >
                    Confirm Cancel
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}