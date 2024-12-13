import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Receipt, Camera } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface OrderItem {
  id: number
  name: string
  quantity: number
  price: number
  professor?: string
}

interface CustomerInfo {
  name: string
  studentId: string
  contactNumber: string
  professor: string | null
}

export default function QueueConfirmation() {
  const navigate = useNavigate()
  const [queueNumber, setQueueNumber] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [total, setTotal] = useState(0)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeData = () => {
      console.log('Initializing QueueConfirmation...')
      
      const number = localStorage.getItem('queueNumber')
      const storedItems = localStorage.getItem('orderItems')
      const storedTotal = localStorage.getItem('orderTotal')
      const storedCustomerInfo = localStorage.getItem('customerInfo')
      
      console.log('Retrieved from localStorage:', {
        number,
        storedItems,
        storedTotal,
        storedCustomerInfo
      })

      if (!number) {
        console.log('No queue number found, redirecting to device page')
        navigate('/device')
        return
      }

      setQueueNumber(number)
      if (storedItems) setOrderItems(JSON.parse(storedItems))
      if (storedTotal) setTotal(parseFloat(storedTotal))
      if (storedCustomerInfo) setCustomerInfo(JSON.parse(storedCustomerInfo))
      
      console.log('Data initialized:', {
        queueNumber: number,
        orderItems: storedItems ? JSON.parse(storedItems) : [],
        total: storedTotal ? parseFloat(storedTotal) : 0,
        customerInfo: storedCustomerInfo ? JSON.parse(storedCustomerInfo) : null
      })
      
      setIsLoading(false)
    }

    initializeData()
  }, [navigate])

  useEffect(() => {
    console.log('QueueConfirmation component mounted')
    return () => {
      console.log('QueueConfirmation component unmounted')
    }
  }, [])

  const handleBackToMenu = () => {
    localStorage.removeItem('queueNumber')
    localStorage.removeItem('orderItems')
    localStorage.removeItem('orderTotal')
    localStorage.removeItem('customerInfo')
    navigate('/device')
  }

  if (isLoading || !queueNumber) {
    console.log('Still loading or no queue number')
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Card className="border-2 shadow-lg">
          <CardContent className="p-6 space-y-4">
            {/* Queue Number */}
            <div className="text-center space-y-2">
              <div className="bg-primary/10 text-primary rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold">Order Confirmed!</h2>
              <div>
                <p className="text-sm text-muted-foreground">Queue Number</p>
                <p className="text-4xl font-bold text-primary">{queueNumber}</p>
              </div>
            </div>

            <Separator />

            {/* Customer Info */}
            {customerInfo && (
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="col-span-2 font-medium text-right">{customerInfo.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-muted-foreground">Student ID:</span>
                  <span className="col-span-2 font-medium text-right">{customerInfo.studentId}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="col-span-2 font-medium text-right">{customerInfo.contactNumber}</span>
                </div>
                {customerInfo.professor && (
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Professor:</span>
                    <span className="col-span-2 font-medium text-right">{customerInfo.professor}</span>
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Order Items */}
            <div className="space-y-2">
              {orderItems.map((item, index) => (
                <div key={index} className="text-sm">
                  <div className="flex justify-between">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  {item.professor && (
                    <p className="text-xs text-muted-foreground">Prof: {item.professor}</p>
                  )}
                </div>
              ))}
              <div className="flex justify-between font-medium pt-2">
                <span>Total</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-orange-100 dark:bg-orange-900/20 rounded-lg p-3 text-sm space-y-1">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <Camera className="h-4 w-4" />
                <span className="font-medium">Important!</span>
              </div>
              <p className="text-orange-600/80 dark:text-orange-400/80">
                Please take a photo of your queue number for reference.
              </p>
            </div>

            <Button 
              onClick={handleBackToMenu}
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
