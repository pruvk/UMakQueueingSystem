import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

const dummyItems = [
  {
    id: 1,
    name: "Coffee",
    price: 25.00,
    category: "Beverages",
    image: "/api/placeholder/200/200",
    description: "Hot brewed coffee"
  },
  {
    id: 2,
    name: "Iced Coffee",
    price: 35.00,
    category: "Beverages",
    image: "/api/placeholder/200/200",
    description: "Cold brewed coffee with ice"
  },
  {
    id: 3,
    name: "Green Tea",
    price: 20.00,
    category: "Beverages",
    image: "/api/placeholder/200/200",
    description: "Hot green tea"
  },
  {
    id: 4,
    name: "Chocolate Cake",
    price: 45.00,
    category: "Desserts",
    image: "/api/placeholder/200/200",
    description: "Rich chocolate cake slice"
  },
  {
    id: 5,
    name: "Cheesecake",
    price: 50.00,
    category: "Desserts",
    image: "/api/placeholder/200/200",
    description: "Classic New York cheesecake"
  },
  {
    id: 6,
    name: "Sandwich",
    price: 40.00,
    category: "Food",
    image: "/api/placeholder/200/200",
    description: "Classic club sandwich"
  },
  {
    id: 7,
    name: "Pasta",
    price: 65.00,
    category: "Food",
    image: "/api/placeholder/200/200",
    description: "Spaghetti with tomato sauce"
  },
  {
    id: 8,
    name: "French Fries",
    price: 35.00,
    category: "Snacks",
    image: "/api/placeholder/200/200",
    description: "Crispy potato fries"
  }
]

export default function DeviceCatalog() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Catalog</h1>
          <p className="text-muted-foreground">Select items to add to cart</p>
        </div>
        <ModeToggle />
      </div>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button variant="outline" className="whitespace-nowrap">
            All Items
          </Button>
          <Button variant="outline" className="whitespace-nowrap">
            Beverages
          </Button>
          <Button variant="outline" className="whitespace-nowrap">
            Food
          </Button>
          <Button variant="outline" className="whitespace-nowrap">
            Desserts
          </Button>
          <Button variant="outline" className="whitespace-nowrap">
            Snacks
          </Button>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {dummyItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              className="h-48 w-full object-cover"
            />
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="mt-2 text-lg font-bold">₱{item.price.toFixed(2)}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              <Button size="sm">Add to Cart</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Fixed Cart Button */}
      <Button 
        className="fixed bottom-4 right-4 shadow-lg" 
        size="lg"
      >
        View Cart (0)
      </Button>
    </div>
  )
}