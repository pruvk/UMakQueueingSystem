import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Queue {
  queueNumber: string
  status: string
}

export default function Display() {
  const [queues, setQueues] = useState<Queue[]>([])
  const [audio] = useState(new Audio("/notification.mp3")) // Add a notification sound file

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
      setQueues(data);
    } catch (error) {
      console.error('Error fetching queues:', error);
    }
  };

  useEffect(() => {
    fetchQueues()
    const interval = setInterval(fetchQueues, 3000) // Refresh every 3 seconds
    return () => clearInterval(interval)
  }, [])

  const nowServing = queues.filter(q => q.status === "serving")
  const waiting = queues.filter(q => q.status === "waiting").slice(0, 5)
  const completed = queues.filter(q => q.status === "completed").slice(-3)

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Now Serving */}
        <div className="bg-blue-900 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">NOW SERVING</h2>
          <div className="space-y-4">
            <AnimatePresence>
              {nowServing.map((queue) => (
                <motion.div
                  key={queue.queueNumber}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-6xl font-bold text-center p-4 bg-blue-800 rounded-lg"
                >
                  {queue.queueNumber}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Up Next */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">UP NEXT</h2>
          <div className="space-y-2">
            {waiting.map((queue) => (
              <div
                key={queue.queueNumber}
                className="text-3xl text-center p-2 bg-gray-800 rounded"
              >
                {queue.queueNumber}
              </div>
            ))}
          </div>
        </div>

        {/* Recently Completed */}
        <div className="bg-green-900 rounded-lg p-6 md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">COMPLETED</h2>
          <div className="flex justify-center gap-4">
            {completed.map((queue) => (
              <div
                key={queue.queueNumber}
                className="text-2xl text-center p-2 bg-green-800 rounded min-w-[120px]"
              >
                {queue.queueNumber}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}