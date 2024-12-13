import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Monitor } from "lucide-react"
import { useDisplay } from "@/contexts/DisplayContext"

interface Queue {
  queueNumber: string
  status: string
  cashierId?: number
}

interface Cashier {
  id: number
  name: string
  currentNumber: string
  status: 'active' | 'inactive'
}

export default function Display() {
  const [queues, setQueues] = useState<Queue[]>([])
  const [cashiers, setCashiers] = useState<Cashier[]>([])
  const [audio] = useState(new Audio("/notification.mp3"))
  const { currentQueue, setCurrentQueue } = useDisplay()

  const fetchCashiers = async () => {
    try {
      const response = await fetch('http://localhost:5272/api/cashier', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cashiers');
      }

      const data = await response.json();
      setCashiers(data);
    } catch (error) {
      console.error('Error fetching cashiers:', error);
    }
  };

  const fetchQueues = async () => {
    try {
      const response = await fetch('http://localhost:5272/api/Queue', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch queues');
      }

      const data = await response.json();
      const filteredQueues = data.filter((queue: Queue) => queue.queueNumber !== "0000");
      setQueues(filteredQueues);
    } catch (error) {
      console.error('Error fetching queues:', error);
    }
  };

  useEffect(() => {
    fetchQueues()
    fetchCashiers()
    const interval = setInterval(() => {
      fetchQueues()
      fetchCashiers()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const activeCashierNumbers = cashiers
    .filter(c => c.status === 'active' && c.currentNumber !== "0000")
    .map(c => c.currentNumber);

  const nowServing = queues.filter(q => 
    q.status === "serving" && 
    q.queueNumber !== "0000" && 
    activeCashierNumbers.includes(q.queueNumber)
  )
  
  const waiting = queues
    .filter(q => q.status === "waiting" && q.queueNumber !== "0000")
    .sort((a, b) => a.queueNumber.localeCompare(b.queueNumber))

  const handlePopOut = () => {
    // Open a new window with the display content
    const displayWindow = window.open(
      '/staff/display-only', 
      'DisplayWindow',
      'width=1024,height=768,menubar=no,toolbar=no,location=no,status=no'
    )
    
    // Focus the new window
    if (displayWindow) {
      displayWindow.focus()
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Queue Display</h1>
        <Button onClick={handlePopOut}>
          <Monitor className="mr-2 h-4 w-4" />
          Pop Out Display
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Now Serving */}
        <div className="bg-card rounded-lg p-6 border shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-primary">NOW SERVING</h2>
          <div className="space-y-4">
            <AnimatePresence>
              {nowServing.length > 0 ? (
                nowServing.map((queue) => (
                  <motion.div
                    key={queue.queueNumber}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-6xl font-bold text-center p-4 bg-primary text-primary-foreground rounded-lg shadow-md"
                  >
                    {queue.queueNumber}
                  </motion.div>
                ))
              ) : (
                <div className="text-3xl text-center p-4 text-muted-foreground">
                  No active queues
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Waiting */}
        <div className="bg-card rounded-lg p-6 border shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-secondary">WAITING</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[600px] overflow-y-auto">
            {waiting.length > 0 ? (
              waiting.map((queue) => (
                <motion.div
                  key={queue.queueNumber}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-2xl font-semibold text-center p-2 bg-secondary text-secondary-foreground rounded-lg shadow-sm"
                >
                  {queue.queueNumber}
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-2xl text-center p-4 text-muted-foreground">
                No queues waiting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}