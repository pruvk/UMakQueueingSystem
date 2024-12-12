import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MinusIcon, PlusIcon, Trash2, ArrowLeft, ShoppingCart, Package } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { motion, AnimatePresence } from "framer-motion"

export default function DeviceCart() {
  const { items, removeItem, updateQuantity, subtotal, total } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                className="mr-2"
                onClick={() => navigate('/device/catalog')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Catalog
              </Button>
              <h1 className="text-3xl font-bold">Shopping Cart</h1>
              <div className="w-[100px]" /> {/* Spacer for centering */}
            </div>
            <Card className="mt-8">
              <CardContent className="flex flex-col items-center justify-center p-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <ShoppingCart className="mb-6 h-24 w-24 text-muted-foreground opacity-80" />
                </motion.div>
                <h2 className="mb-3 text-2xl font-semibold">Your cart is empty</h2>
                <p className="mb-6 text-muted-foreground">Add items from the catalog to get started</p>
                <Button 
                  size="lg"
                  onClick={() => navigate('/device/catalog')}
                  className="px-8"
                >
                  <Package className="mr-2 h-5 w-5" />
                  Browse Catalog
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto max-w-4xl"
        >
          <div className="mb-8 flex items-center justify-between">
            <Button 
              variant="ghost" 
              className="mr-2"
              onClick={() => navigate('/device/catalog')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Button>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <div className="w-[100px]" /> {/* Spacer for centering */}
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Cart Items */}
            <div className="md:col-span-2">
              <Card className="overflow-hidden">
                <CardHeader className="bg-primary/5">
                  <CardTitle>Cart Items ({items.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 last:mb-0"
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative h-24 w-24 overflow-hidden rounded-lg">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                            />
                          </div>
                          <div className="flex flex-1 flex-col">
                            <div className="flex justify-between">
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="font-medium text-primary">₱{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">₱{item.price.toFixed(2)} each</p>
                            <div className="mt-3 flex items-center gap-2">
                              <div className="flex items-center rounded-lg border p-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, -1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <MinusIcon className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, 1)}
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="ml-2 h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <Separator className="mt-6" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <Card className="sticky top-4 overflow-hidden">
                <CardHeader className="bg-primary/5">
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₱{subtotal.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-medium">
                        <span>Total</span>
                        <span className="text-primary">₱{total.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full"
                      size="lg"
                      onClick={() => navigate('/device/checkout')}
                    >
                      Proceed to Checkout
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