import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { tursoHelpers } from "@/lib/turso"
import { z } from "zod"

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  image: z.string().url("Image must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  stock: z.number().int().min(0, "Stock must be non-negative"),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    // Try to use Turso first, fallback to Prisma
    let products;
    
    try {
      // Use libSQL client
      products = await tursoHelpers.getAllProducts();
      
      // Apply filters if needed
      if (category) {
        products = products.filter((product: any) => product.category === category);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter((product: any) => 
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
        );
      }
    } catch (tursoError) {
      console.log('Turso products fetch failed, falling back to Prisma:', tursoError);
      
      // Fallback to Prisma
      const where: Record<string, unknown> = {}

      if (category) {
        where.category = category
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ]
      }

      products = await prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
      })
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error("Products API Error:", error)
    
    // Check for database connection errors
    if (error instanceof Error) {
      if (error.message.includes("connect") || error.message.includes("database")) {
        return NextResponse.json(
          { error: "Database connection error. Please check your DATABASE_URL configuration." },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: "Internal server error", details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const productData = productSchema.parse(body)

    // Try to use Turso first, fallback to Prisma
    let product;
    
    try {
      // Use libSQL client
      const { turso } = await import('@/lib/turso');
      const productId = crypto.randomUUID();
      
      await turso.execute({
        sql: `INSERT INTO Product (id, name, description, price, image, category, stock, createdAt, updatedAt) 
              VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [productId, productData.name, productData.description, productData.price, productData.image, productData.category, productData.stock]
      });
      
      product = { id: productId, ...productData, createdAt: new Date(), updatedAt: new Date() };
    } catch (tursoError) {
      console.log('Turso product creation failed, falling back to Prisma:', tursoError);
      
      // Fallback to Prisma
      product = await prisma.product.create({
        data: productData,
      })
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
