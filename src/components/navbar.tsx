"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, LogOut } from "lucide-react"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 shadow-xl border-b-4 border-yellow-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-white diwali-glow">
            🛍️ Indian Store
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/products">
              <Button variant="ghost" className="text-white hover:bg-white/20 font-semibold">🛍️ Products</Button>
            </Link>

            {session ? (
              <>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant="ghost" className="text-white hover:bg-white/20 font-semibold">📦 Orders</Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" className="text-white hover:bg-white/20 font-semibold">👤 Profile</Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-white" />
                  <span className="text-sm text-white font-semibold">{session.user?.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    className="text-white hover:bg-white/20"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 font-semibold">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold border-2 border-green-400">✨ Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
