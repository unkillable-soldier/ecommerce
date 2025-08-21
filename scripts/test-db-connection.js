const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    console.log('📊 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('📊 TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL ? 'Set' : 'Not set');
    console.log('📊 TURSO_AUTH_TOKEN:', process.env.TURSO_AUTH_TOKEN ? 'Set' : 'Not set');
    
    // Test connection by trying to count products
    const productCount = await prisma.product.count();
    console.log(`✅ Database connection successful! Found ${productCount} products`);
    
    // Test users
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users`);
    
    // Test orders
    const orderCount = await prisma.order.count();
    console.log(`✅ Found ${orderCount} orders`);
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('connect')) {
      console.log('💡 This looks like a connection issue. Check your DATABASE_URL and TURSO_AUTH_TOKEN.');
    }
    
    if (error.message.includes('table')) {
      console.log('💡 This looks like a schema issue. Run the database migration first.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
