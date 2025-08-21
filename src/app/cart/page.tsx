"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Minus, Plus, ShoppingBag, MapPin } from "lucide-react"
import { toast } from "sonner"

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    description: string
    price: number
    image: string
    stock: number
  }
}

interface Address {
  id: string
  type: string
  fullName: string
  phoneNumber: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchCartItems()
    fetchAddresses()
  }, [])

  const fetchCartItems = async () => {
    try {
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        setCartItems(data)
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses")
      if (response.ok) {
        const data = await response.json()
        setAddresses(data)
        // Set default address if available
        const defaultAddress = data.find((addr: Address) => addr.isDefault)
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (response.ok) {
        fetchCartItems()
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchCartItems()
      }
    } catch (error) {
      console.error("Error removing item:", error)
    }
  }

  const checkout = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address")
      setShowAddressModal(true)
      return
    }

    setIsCheckingOut(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingAddressId: selectedAddressId,
        }),
      })

      if (response.ok) {
        toast.success("Order placed successfully!")
        router.push("/orders")
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to place order")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      toast.error("Error placing order")
    } finally {
      setIsCheckingOut(false)
    }
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading cart...</div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border-2 border-blue-200">
        <ShoppingBag className="h-16 w-16 text-blue-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some products to get started!</p>
        <Button onClick={() => router.push("/products")} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">🛒 Shopping Cart</h1>
        <p className="text-gray-700 font-semibold">
          {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-lg border-2 border-gray-200 p-4 flex items-center space-x-4 hover:shadow-xl transition-shadow"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border-2 border-gray-300">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">{item.product.name}</h3>
                <p className="text-gray-700 text-sm mb-2 font-medium">
                  {item.product.description}
                </p>
                <p className="text-lg font-bold text-green-600">
                  💰 ₹{(item.product.price * 83).toFixed(0)}
                </p>
              </div>
              <div className="flex items-center space-x-2 bg-white rounded-lg p-2 border-2 border-gray-300">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-bold text-gray-800 text-lg">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock}
                  className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeItem(item.id)}
                className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg border-2 border-blue-200 p-6 h-fit">
          <h2 className="text-xl font-bold mb-4 text-gray-800">📋 Order Summary</h2>
          <div className="space-y-3 mb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white/70 rounded-lg p-3">
                <span className="text-gray-800 font-medium">
                  {item.product.name} x {item.quantity}
                </span>
                <span className="text-gray-800 font-bold">₹{(item.product.price * item.quantity * 83).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-blue-300 pt-4 bg-white/70 rounded-lg p-3">
            <div className="flex justify-between text-lg font-bold text-gray-800">
              <span>Total</span>
              <span className="text-green-600">₹{(total * 83).toFixed(0)}</span>
            </div>
          </div>
          {addresses.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Shipping Address</span>
                </div>
                <Button
                  onClick={() => setShowAddressModal(true)}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  Change
                </Button>
              </div>
              {selectedAddressId && (
                <div className="mt-2 text-sm text-gray-600">
                  {(() => {
                    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId)
                    return selectedAddress ? (
                      <div>
                        <p className="font-medium">{selectedAddress.fullName}</p>
                        <p>{selectedAddress.street}, {selectedAddress.city}</p>
                      </div>
                    ) : null
                  })()}
                </div>
              )}
            </div>
          )}

          <Button
            onClick={checkout}
            disabled={isCheckingOut}
            className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold"
          >
            {isCheckingOut ? "Processing..." : "💳 Checkout"}
          </Button>
          
          {addresses.length === 0 && (
            <Button
              onClick={() => router.push("/profile")}
              variant="outline"
              className="w-full mt-2 border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Add Shipping Address
            </Button>
          )}
        </div>
      </div>

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 text-gray-800">📍 Select Shipping Address</h3>
            
            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No addresses found</p>
                <Button
                  onClick={() => {
                    setShowAddressModal(false)
                    router.push("/profile")
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Add Address
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedAddressId === address.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedAddressId(address.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-bold text-gray-800">
                            {address.type}
                          </span>
                          {address.isDefault && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-gray-800">{address.fullName}</p>
                        <p className="text-gray-600 text-sm">{address.phoneNumber}</p>
                        <p className="text-gray-600 text-sm mt-1">
                          {address.street}, {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p className="text-gray-600 text-sm">{address.country}</p>
                      </div>
                      {selectedAddressId === address.id && (
                        <div className="text-blue-500">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedAddressId) {
                        setShowAddressModal(false)
                        checkout()
                      } else {
                        toast.error("Please select an address")
                      }
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Continue to Checkout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
