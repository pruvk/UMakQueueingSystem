import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw } from "lucide-react"

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
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchQueues(), fetchCashiers()]);
    setTimeout(() => setIsRefreshing(false), 1000);
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
  
  const waiting = queues.filter(q => q.status === "waiting" && q.queueNumber !== "0000").slice(0, 5)

  return (
    <div className="min-h-screen bg-background text-foreground p-8 relative">
      <button
        onClick={handleRefresh}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
        disabled={isRefreshing}
      >
        <RefreshCw 
          className={`h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`} 
        />
      </button>

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

        {/* Up Next */}
        <div className="bg-card rounded-lg p-6 border shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-secondary">UP NEXT</h2>
          <div className="space-y-2">
            {waiting.length > 0 ? (
              waiting.map((queue) => (
                <div
                  key={queue.queueNumber}
                  className="text-3xl font-semibold text-center p-2 bg-secondary text-secondary-foreground rounded-lg shadow-sm"
                >
                  {queue.queueNumber}
                </div>
              ))
            ) : (
              <div className="text-2xl text-center p-4 text-muted-foreground">
                No queues waiting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}