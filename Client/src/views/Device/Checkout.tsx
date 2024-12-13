import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, Wallet, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { motion } from "framer-motion"

export default function Checkout() {
  const { items, total, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [studentId, setStudentId] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [professor, setProfessor] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")

  const handleSubmitOrder = async () => {
    if (!customerName || !studentId || !contactNumber || !professor) {
      setError("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error("Not authenticated")
      
      const decoded = JSON.parse(atob(token.split('.')[1]))
      console.log('Decoded token:', decoded)
      
      // Get deviceId from JWT token claims
      const deviceId = decoded.nameid || decoded.sub || decoded.id || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
      
      console.log('Found deviceId:', deviceId)
      
      if (!deviceId) throw new Error("Device ID not found")

      const orderData = {
        deviceId: parseInt(deviceId),
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total,
        status: 'pending',
        customerInfo: {
          name: customerName,
          studentId,
          contactNumber,
          professor
        },
        paymentMethod
      }

      const response = await fetch('http://localhost:5272/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const text = await response.text()
        try {
          const errorData = JSON.parse(text)
          throw new Error(errorData.message || 'Failed to create order')
        } catch (e) {
          throw new Error(`Server error: ${text}`)
        }
      }

      const orderResponse = await response.json()
      
      // Store all data before navigation
      const queueNumber = `A${orderResponse.orderId.toString().padStart(3, '0')}`
      localStorage.setItem('orderItems', JSON.stringify(items))
      localStorage.setItem('orderTotal', total.toString())
      localStorage.setItem('queueNumber', queueNumber)

      // Clear cart first
      clearCart()

      // Use setTimeout to delay navigation slightly
      setTimeout(() => {
        navigate('/device/queue-confirmation')
      }, 0)

    } catch (err) {
      console.error('Order submission error:', err)
      setError(err instanceof Error ? err.message : "Failed to submit order")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    navigate('/device')
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8 flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/device/cart')}
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <div className="w-[100px]" /> {/* Spacer for centering */}
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Customer Information Form */}
            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="flex items-center">
                    <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                      1
                    </span>
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Full Name</Label>
                      <Input
                        id="customerName"
                        placeholder="Juan Dela Cruz"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        placeholder="a12345678"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact Number</Label>
                      <Input
                        id="contactNumber"
                        placeholder="09XX-XXX-XXXX"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className="transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="professor">Professor</Label>
                      <Input
                        id="professor"
                        placeholder="Prof. Juan Dela Cruz"
                        value={professor}
                        onChange={(e) => setProfessor(e.target.value)}
                        className="transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="flex items-center">
                    <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                      2
                    </span>
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    <div className="flex items-center rounded-lg border p-4 transition-all hover:bg-accent">
                      <RadioGroupItem value="cash" id="cash" className="mr-3" />
                      <div className="flex flex-1 items-center">
                        <Wallet className="mr-3 h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="cash" className="flex-1 cursor-pointer">Cash</Label>
                      </div>
                    </div>
                    <div className="flex items-center rounded-lg border p-4 transition-all hover:bg-accent">
                      <RadioGroupItem value="gcash" id="gcash" className="mr-3" />
                      <div className="flex flex-1 items-center">
                        <CreditCard className="mr-3 h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="gcash" className="flex-1 cursor-pointer">GCash</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-4 border-2">
                <CardHeader className="bg-primary/5">
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex flex-1 justify-between">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">₱{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₱{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">₱{total.toFixed(2)}</span>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </div>
                    )}

                    <Button 
                      className="w-full"
                      size="lg"
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : `Pay ₱${total.toFixed(2)}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}