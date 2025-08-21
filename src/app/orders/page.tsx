"use client"

import { useState, useEffect } from "react"
import { Package, Calendar } from "lucide-react"
import { toast } from "sonner"

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image: string
  }
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  orderItems: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "PROCESSING":
        return "bg-blue-100 text-blue-800"
      case "SHIPPED":
        return "bg-purple-100 text-purple-800"
      case "DELIVERED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">📦 My Orders</h1>
        <p className="text-gray-700 font-semibold">Track your order history and status</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-2xl border-2 border-yellow-200">
          <Package className="h-16 w-16 text-orange-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gray-800">No orders yet</h2>
          <p className="text-gray-600">Start shopping to see your orders here!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Package className="h-6 w-6 text-purple-500" />
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Order #{order.id.slice(-8)}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-700">
                        <div className="flex items-center space-x-1 bg-white/70 rounded-lg px-3 py-1">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 bg-white/70 rounded-lg px-3 py-1">
                          <span className="text-purple-500 font-bold">💰</span>
                          <span className="font-bold text-gray-800">₹{(order.total * 83).toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                <h4 className="font-bold mb-4 text-gray-800 text-lg">📦 Order Items</h4>
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border-2 border-gray-300">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-800">{item.product.name}</h5>
                        <p className="text-sm text-gray-700 font-medium">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border-2 border-green-200">
                        <p className="font-bold text-gray-800 text-lg">
                          ₹{(item.price * item.quantity * 83).toFixed(0)}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">
                          ₹{(item.price * 83).toFixed(0)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
