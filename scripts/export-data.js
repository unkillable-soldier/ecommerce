const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log('🔄 Exporting data from SQLite database...');
    
    // Export all data
    const data = {
      users: await prisma.user.findMany(),
      products: await prisma.product.findMany(),
      orders: await prisma.order.findMany(),
      orderItems: await prisma.orderItem.findMany(),
      cartItems: await prisma.cartItem.findMany(),
      addresses: await prisma.address.findMany(),
      accounts: await prisma.account.findMany(),
      sessions: await prisma.session.findMany(),
      verificationTokens: await prisma.verificationToken.findMany(),
    };

    // Create scripts directory if it doesn't exist
    const scriptsDir = path.join(__dirname);
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }

    // Write data to JSON file
    const exportPath = path.join(scriptsDir, 'exported-data.json');
    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));
    
    console.log('✅ Data exported successfully to scripts/exported-data.json');
    console.log(`📊 Exported ${data.users.length} users`);
    console.log(`📊 Exported ${data.products.length} products`);
    console.log(`📊 Exported ${data.orders.length} orders`);
    console.log(`📊 Exported ${data.cartItems.length} cart items`);
    console.log(`📊 Exported ${data.addresses.length} addresses`);
    
  } catch (error) {
    console.error('❌ Error exporting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
