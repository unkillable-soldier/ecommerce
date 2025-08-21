import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL
  
  // If using Turso, we need to use a different approach
  if (databaseUrl?.includes('libsql://')) {
    // For now, fall back to local SQLite in development
    if (process.env.NODE_ENV === 'development') {
      return new PrismaClient({
        datasources: {
          db: {
            url: "file:./dev.db"
          }
        }
      })
    }
  }
  
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
