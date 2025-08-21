import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const addressSchema = z.object({
  type: z.enum(["HOME", "WORK", "OTHER"]),
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(6, "Postal code must be at least 6 digits"),
  country: z.string().default("India"),
  isDefault: z.boolean().default(false),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const address = await prisma.address.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    return NextResponse.json(address)
  } catch (error) {
    console.error("Error fetching address:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const addressData = addressSchema.parse(body)

    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    // If this is set as default, unset other defaults
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: session.user.id,
          id: { not: id },
        },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.update({
      where: { id: id },
      data: addressData,
    })

    return NextResponse.json(address)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues && error.issues.length > 0 
        ? error.issues[0].message 
        : "Validation error"
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    console.error("Error updating address:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    await prisma.address.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: "Address deleted successfully" })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
