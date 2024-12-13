import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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

export default function DisplayOnly() {
  const [queues, setQueues] = useState<Queue[]>([])
  const [cashiers, setCashiers] = useState<Cashier[]>([])

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
  
  const waiting = queues.filter(q => q.status === "waiting" && q.queueNumber !== "0000").slice(0, 5)

  // Dynamic sizing based on number of items
  const getServingTextSize = (count: number) => {
    if (count <= 2) return 'text-8xl'
    if (count <= 3) return 'text-7xl'
    if (count <= 4) return 'text-6xl'
    return 'text-5xl'
  }

  const getWaitingTextSize = (count: number) => {
    if (count <= 2) return 'text-6xl'
    if (count <= 3) return 'text-5xl'
    if (count <= 4) return 'text-4xl'
    return 'text-3xl'
  }

  const servingTextSize = getServingTextSize(nowServing.length)
  const waitingTextSize = getWaitingTextSize(waiting.length)

  return (
    <div className="h-screen w-screen p-8 bg-background">
      <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Now Serving */}
        <div className="bg-card rounded-lg p-6 border shadow-lg flex flex-col">
          <h2 className="text-4xl font-bold mb-4 text-[#f59e0b] text-center">NOW SERVING</h2>
          <div className="flex-1 flex flex-col justify-center space-y-2">
            <AnimatePresence>
              {nowServing.length > 0 ? (
                <div className={`grid gap-2 ${nowServing.length > 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {nowServing.map((queue) => (
                    <motion.div
                      key={queue.queueNumber}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`${servingTextSize} font-bold text-center p-4 bg-[#f59e0b] text-white rounded-lg shadow-md`}
                    >
                      {queue.queueNumber}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-5xl text-center p-8 text-muted-foreground">
                  No active queues
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Up Next */}
        <div className="bg-card rounded-lg p-6 border shadow-lg flex flex-col">
          <h2 className="text-4xl font-bold mb-4 text-[#ea580c] text-center">UP NEXT</h2>
          <div className="flex-1 flex flex-col justify-center space-y-2">
            {waiting.length > 0 ? (
              <div className={`grid gap-2 ${waiting.length > 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {waiting.map((queue) => (
                  <div
                    key={queue.queueNumber}
                    className={`${waitingTextSize} font-semibold text-center p-4 bg-[#ea580c] text-white rounded-lg shadow-sm`}
                  >
                    {queue.queueNumber}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-4xl text-center p-8 text-muted-foreground">
                No queues waiting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 