import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShoppingBag, Truck, Shield, Clock } from "lucide-react"

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 text-white rounded-2xl shadow-2xl border-4 border-yellow-300">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 diwali-glow">
            🛍️ Namaste! Welcome to Our Store
          </h1>
          <p className="text-xl mb-8 text-yellow-100 font-semibold">
            Discover amazing products with Indian charm at unbeatable prices! ✨ Shop with confidence and enjoy lightning-fast delivery across India.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold border-2 border-green-400 shadow-lg">
                🛒 Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-orange-600 font-bold">
                ✨ Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-4 gap-8">
        <div className="text-center p-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl border-2 border-yellow-200 hover:scale-105 transition-transform duration-300">
          <ShoppingBag className="h-16 w-16 text-orange-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-3 text-gray-800">🛍️ Wide Selection</h3>
          <p className="text-gray-700 font-medium">Browse thousands of products across all categories with Indian favorites!</p>
        </div>
        <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl border-2 border-green-200 hover:scale-105 transition-transform duration-300">
          <Truck className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-3 text-gray-800">🚚 Lightning Fast Delivery</h3>
          <p className="text-gray-700 font-medium">Get your orders delivered across India quickly and safely</p>
        </div>
        <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl border-2 border-purple-200 hover:scale-105 transition-transform duration-300">
          <Shield className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-3 text-gray-800">🔒 Secure Shopping</h3>
          <p className="text-gray-700 font-medium">Your data is protected with industry-standard security</p>
        </div>
        <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-xl border-2 border-blue-200 hover:scale-105 transition-transform duration-300">
          <Clock className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-3 text-gray-800">🕐 24/7 Support</h3>
          <p className="text-gray-700 font-medium">Our customer support team is always here to help you</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl shadow-2xl border-4 border-yellow-300">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4 text-white diwali-glow">🎉 Ready to Start Shopping?</h2>
          <p className="text-yellow-100 mb-8 text-lg font-semibold">
            Join thousands of satisfied customers across India who trust us for their shopping needs! 🇮🇳
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold border-2 border-green-400 shadow-lg">
              🛒 Explore Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
