export type OrderItem = {
    productId: number
    quantity: number
    price: number
  }
  
  export type Order = {
    deviceId: number
    items: OrderItem[]
    total: number
    status: 'pending' | 'processing' | 'completed' | 'cancelled'
  }