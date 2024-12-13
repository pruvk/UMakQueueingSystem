import { createContext, useContext, useState, ReactNode } from 'react'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
  type: string
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (itemId: number) => void
  updateQuantity: (itemId: number, quantity: number) => void
  clearCart: () => void
  total: number
  subtotal: number
  tax: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (newItem: CartItem) => {
    console.log('Adding new item:', newItem)
    console.log('Current items:', items)
    
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(item => item.id === newItem.id)
      console.log('Existing item index:', existingItemIndex)
      
      if (existingItemIndex >= 0) {
        console.log('Updating existing item')
        const updatedItems = [...currentItems]
        updatedItems[existingItemIndex] = {
          ...currentItems[existingItemIndex],
          quantity: currentItems[existingItemIndex].quantity + 1
        }
        return updatedItems
      }
      
      console.log('Adding brand new item')
      return [...currentItems, { ...newItem, quantity: 1 }]
    })
  }

  const removeItem = (itemId: number) => {
    setItems(currentItems => currentItems.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: number, newQuantity: number) => {
    setItems(currentItems => 
      currentItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity: Math.max(1, item.quantity + newQuantity) }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const total = subtotal

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total,
      subtotal,
      tax: 0
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}