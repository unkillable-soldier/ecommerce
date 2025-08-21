"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Search } from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
}

export default function ProductsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data)
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map((product: Product) => product.category))]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }

  const addToCart = async (productId: string) => {
    if (!session) {
      toast.error("Please sign in to add items to your cart")
      router.push("/auth/signin")
      return
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      })

      if (response.ok) {
        toast.success("Product added to cart!")
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to add product to cart")
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Error adding to cart")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center bg-gradient-to-r from-orange-100 to-yellow-100 p-8 rounded-2xl border-2 border-orange-200">
        <h1 className="text-5xl font-bold mb-4 text-gray-800">🛍️ Our Products</h1>
        <p className="text-xl text-gray-700 font-semibold">Discover our amazing collection of products with Indian charm! ✨</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 h-5 w-5" />
          <Input
            type="text"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 bg-white/90 backdrop-blur-sm border-2 border-orange-400 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 border-2 border-purple-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/90 backdrop-blur-sm font-semibold text-gray-800"
          style={{
            color: '#1f2937',
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}
        >
          <option value="" className="text-gray-800 bg-white">🎯 All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category} className="text-gray-800 bg-white">
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-xl border-4 border-yellow-300 overflow-hidden hover:scale-105 transition-transform duration-300 floating">
            <div className="aspect-square bg-gradient-to-br from-orange-100 to-yellow-100 relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                ✨
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-xl mb-3 text-gray-800">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-green-600">
                  💰 ₹{(product.price * 83).toFixed(0)}
                </span>
                <Button
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock === 0}
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold border-2 border-orange-400"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.stock === 0 ? "Out of Stock" : session ? "Add to Cart" : "Sign in to Add"}
                </Button>
              </div>
              {product.stock > 0 && (
                <p className="text-sm text-green-600 font-semibold">
                  📦 {product.stock} in stock
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-r from-gray-100 to-gray-200 p-8 rounded-2xl border-2 border-gray-300">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-2xl text-gray-800 font-bold">No products found</p>
          <p className="text-gray-600 mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
