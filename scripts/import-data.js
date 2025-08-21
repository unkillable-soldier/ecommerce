const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importData() {
  try {
    console.log('🔄 Importing data to cloud database...');
    
    // Read exported data
    const exportPath = path.join(__dirname, 'exported-data.json');
    if (!fs.existsSync(exportPath)) {
      console.error('❌ exported-data.json not found. Please run export-data.js first.');
      return;
    }
    
    const data = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    
    // Import data in the correct order (respecting foreign key constraints)
    console.log('📥 Importing users...');
    for (const user of data.users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: user,
        create: user,
      });
    }
    
    console.log('📥 Importing products...');
    for (const product of data.products) {
      await prisma.product.upsert({
        where: { id: product.id },
        update: product,
        create: product,
      });
    }
    
    console.log('📥 Importing addresses...');
    for (const address of data.addresses) {
      await prisma.address.upsert({
        where: { id: address.id },
        update: address,
        create: address,
      });
    }
    
    console.log('📥 Importing orders...');
    for (const order of data.orders) {
      await prisma.order.upsert({
        where: { id: order.id },
        update: order,
        create: order,
      });
    }
    
    console.log('📥 Importing order items...');
    for (const orderItem of data.orderItems) {
      await prisma.orderItem.upsert({
        where: { id: orderItem.id },
        update: orderItem,
        create: orderItem,
      });
    }
    
    console.log('📥 Importing cart items...');
    for (const cartItem of data.cartItems) {
      await prisma.cartItem.upsert({
        where: { id: cartItem.id },
        update: cartItem,
        create: cartItem,
      });
    }
    
    console.log('📥 Importing accounts...');
    for (const account of data.accounts) {
      await prisma.account.upsert({
        where: { 
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId
          }
        },
        update: account,
        create: account,
      });
    }
    
    console.log('📥 Importing sessions...');
    for (const session of data.sessions) {
      await prisma.session.upsert({
        where: { sessionToken: session.sessionToken },
        update: session,
        create: session,
      });
    }
    
    console.log('📥 Importing verification tokens...');
    for (const token of data.verificationTokens) {
      await prisma.verificationToken.upsert({
        where: { token: token.token },
        update: token,
        create: token,
      });
    }
    
    console.log('✅ Data imported successfully!');
    
  } catch (error) {
    console.error('❌ Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
