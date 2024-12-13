import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useCart } from "@/contexts/CartContext"
import { useEffect, useState } from "react"
import { ShoppingCart, Search, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"


type Product = {
  id: number
  name: string
  price: number
  description: string
  type: string
  imageUrl?: string
}

export default function DeviceCatalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const { addItem, items } = useCart()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const [modifierKeys, setModifierKeys] = useState({ ctrl: false, shift: false })

  // Define categories with display names and values
  const categories = [
    { display: "All Items", value: "all" },
    { display: "Uniforms", value: "uniforms" },
    { display: "Books", value: "books" },
    { display: "School Supplies", value: "school supplies" }
  ]

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token')
        console.log('Current token:', token)

        if (!token) {
          setError("Not authenticated")
          navigate('/device/login')
          return
        }

        const response = await fetch("http://localhost:5272/api/products", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('Response status:', response.status)

        if (response.status === 401 || response.status === 403) {
          console.log('Auth failed, redirecting to login')
          navigate('/device/login')
          return
        }

        if (!response.ok) throw new Error("Failed to fetch products")
        
        const data = await response.json()
        setProducts(data)
      } catch (err) {
        console.error("Fetch error:", err)
        setError(err instanceof Error ? err.message : "Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [navigate])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Update modifier keys state
      if (e.key === 'Control') setModifierKeys(prev => ({ ...prev, ctrl: true }))
      if (e.key === 'Shift') setModifierKeys(prev => ({ ...prev, shift: true }))

      // Check for the complete combination
      if (e.key === '?' && modifierKeys.ctrl && modifierKeys.shift) {
        e.preventDefault()
        
        // Show confirmation toast
        toast({
          title: "Logging out...",
          description: "You've triggered the secret logout combination",
          duration: 2000,
        })

        // Delay logout slightly to show the toast
        setTimeout(() => {
          localStorage.removeItem('token')
          navigate('/login')
        }, 1000)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      // Reset modifier keys state
      if (e.key === 'Control') setModifierKeys(prev => ({ ...prev, ctrl: false }))
      if (e.key === 'Shift') setModifierKeys(prev => ({ ...prev, shift: false }))
    }

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [modifierKeys, navigate, toast])

  // Optional: Show subtle visual feedback when modifier keys are pressed
  useEffect(() => {
    if (modifierKeys.ctrl && modifierKeys.shift) {
      // You could add a subtle visual indicator here
      document.body.style.opacity = '0.98'
    } else {
      document.body.style.opacity = '1'
    }
  }, [modifierKeys])

  const filteredProducts = products
    .filter(product => 
      selectedCategory === "all" || 
      product.type.toLowerCase().replace("_", " ") === selectedCategory.toLowerCase()
    )
    .filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      type: product.type,
      quantity: 1
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary/5 py-8 md:py-12">
        <div className="container mx-auto px-20">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">UMak Store</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Your one-stop shop for all academic needs
              </p>
            </div>
          </div>

          {/* Search and Categories */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(({ display, value }) => (
                <Button 
                  key={value}
                  variant={selectedCategory === value ? "default" : "outline"} 
                  className="whitespace-nowrap"
                  onClick={() => setSelectedCategory(value)}
                >
                  {display}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-20 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="group relative flex h-[500px] flex-col overflow-hidden transition-all hover:shadow-lg">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div 
                    className="absolute inset-0 bg-black/40 opacity-0 transition-all duration-300 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>
                
                <CardHeader className="flex-none">
                  <CardTitle className="break-words whitespace-normal">
                    {item.name}
                  </CardTitle>
                  <CardDescription className="capitalize">
                    {item.type}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow">
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="mt-4 text-xl font-bold text-primary">
                    ₱{item.price.toFixed(2)}
                  </p>
                </CardContent>

                <CardFooter className="flex-none pb-4">
                  <Button 
                    size="sm" 
                    onClick={() => handleAddToCart(item)}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Buttons */}
      <div className="fixed bottom-4 left-4">
        <ModeToggle />
      </div>

      <Button 
        className="fixed bottom-4 right-4 shadow-xl transition-transform hover:scale-105"
        size="lg"
        onClick={() => navigate('/device/cart')}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        <span className="font-medium">
          Cart ({items.reduce((sum, item) => sum + item.quantity, 0)})
        </span>
      </Button>
    </div>
  )
}