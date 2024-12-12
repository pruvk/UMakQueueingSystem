import { Order, OrderItem } from "@/lib/types/order"

const API_URL = 'http://localhost:5272/api'

export const orderService = {
  // Create a new order
  createOrder: async (orderData: {
    deviceId: number;
    items: OrderItem[];
    total: number;
    status: string;
  }) => {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(orderData)
    })
    if (!response.ok) throw new Error('Failed to create order')
    return response.json()
  },

  // Get orders for a device
  getDeviceOrders: async (deviceId: number) => {
    const response = await fetch(`${API_URL}/orders/device/${deviceId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) throw new Error('Failed to fetch orders')
    return response.json()
  },

  // Get specific order
  getOrder: async (orderId: number) => {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) throw new Error('Failed to fetch order')
    return response.json()
  }
}