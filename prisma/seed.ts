import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing products
  await prisma.product.deleteMany()

  // Create sample products
  const products = [
    {
      name: "Wireless Bluetooth Headphones",
      description: "High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
      price: 99.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      category: "Electronics",
      stock: 50
    },
    {
      name: "Smart Fitness Watch",
      description: "Advanced fitness tracker with heart rate monitoring, GPS, and water resistance. Track your workouts and stay healthy.",
      price: 199.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      category: "Electronics",
      stock: 30
    },
    {
      name: "Organic Cotton T-Shirt",
      description: "Comfortable and sustainable cotton t-shirt made from 100% organic materials. Available in multiple colors and sizes.",
      price: 29.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      category: "Clothing",
      stock: 100
    },
    {
      name: "Leather Crossbody Bag",
      description: "Stylish and practical leather bag perfect for everyday use. Features multiple compartments and adjustable strap.",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop",
      category: "Fashion",
      stock: 25
    },
    {
      name: "Stainless Steel Water Bottle",
      description: "Eco-friendly water bottle that keeps drinks cold for 24 hours or hot for 12 hours. Perfect for outdoor activities.",
      price: 24.99,
      image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
      category: "Home & Garden",
      stock: 75
    },
    {
      name: "Wireless Charging Pad",
      description: "Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.",
      price: 39.99,
      image: "https://images.unsplash.com/photo-1609592806596-b43bada6f5e3?w=400&h=400&fit=crop",
      category: "Electronics",
      stock: 40
    },
    {
      name: "Yoga Mat",
      description: "Premium non-slip yoga mat made from eco-friendly materials. Perfect for yoga, pilates, and fitness workouts.",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop",
      category: "Sports",
      stock: 60
    },
    {
      name: "Ceramic Coffee Mug Set",
      description: "Beautiful handcrafted ceramic mugs perfect for your morning coffee or tea. Set of 4 with matching saucers.",
      price: 34.99,
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=400&fit=crop",
      category: "Home & Garden",
      stock: 45
    }
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product
    })
  }

  console.log('Database seeded with sample products!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
