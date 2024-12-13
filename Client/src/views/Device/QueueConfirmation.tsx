import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Receipt } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface OrderItem {
  id: number
  name: string
  quantity: number
  price: number
}

export default function QueueConfirmation() {
  const navigate = useNavigate()
  const [queueNumber, setQueueNumber] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const number = localStorage.getItem('queueNumber')
    const storedItems = localStorage.getItem('orderItems')
    const storedTotal = localStorage.getItem('orderTotal')
    
    console.log('Queue number:', number)
    console.log('Stored items:', storedItems)
    console.log('Total:', storedTotal)

    if (!number) {
      navigate('/device')
      return
    }

    setQueueNumber(number)
    if (storedItems) setOrderItems(JSON.parse(storedItems))
    if (storedTotal) setTotal(parseFloat(storedTotal))
  }, [navigate])

  if (!queueNumber) return null

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">Your queue number is</p>
              <p className="text-5xl font-bold text-primary mt-2">{queueNumber}</p>
            </div>

            <Separator />

            {/* Order Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium justify-center">
                <Receipt className="h-4 w-4" />
                Order Details
              </div>
              <div className="space-y-2">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground">
              Please wait for your number to be called.
            </p>
            
            <Button 
              onClick={() => {
                localStorage.removeItem('queueNumber')
                localStorage.removeItem('orderItems')
                localStorage.removeItem('orderTotal')
                navigate('/device')
              }} 
              className="w-full"
            >
              Back to Menu
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
