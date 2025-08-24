import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

import { prisma } from "@/lib/prisma"
import { tursoHelpers } from "@/lib/turso"
import bcrypt from "bcryptjs"

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not set")
}

if (!process.env.NEXTAUTH_URL) {
  throw new Error("NEXTAUTH_URL is not set")
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }
  
  interface User {
    id: string
    email: string
    name: string | null
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Try to use Turso first, fallback to Prisma
          let user;
          
          try {
            // Use libSQL client
            user = await tursoHelpers.getUserByEmail(credentials.email);
          } catch (tursoError) {
            console.log('Turso auth failed, falling back to Prisma:', tursoError);
            // Fallback to Prisma
            user = await prisma.user.findUnique({
              where: {
                email: credentials.email
              }
            });
          }

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
