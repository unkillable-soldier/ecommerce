const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

async function deployToTurso() {
  try {
    console.log('🚀 Deploying to Turso...');
    
    // Create Turso client
    const libsqlClient = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    
    const adapter = new PrismaLibSQL(libsqlClient);
    const prisma = new PrismaClient({ adapter });
    
    console.log('✅ Connected to Turso database');
    
    // Read the schema SQL
    const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.sql');
    
    // Create tables using raw SQL
    console.log('📋 Creating database schema...');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Account" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sessionToken" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "expires" DATETIME NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT,
        "email" TEXT NOT NULL,
        "emailVerified" DATETIME,
        "image" TEXT,
        "password" TEXT,
        "role" TEXT NOT NULL DEFAULT 'USER',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      );
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "VerificationToken" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" DATETIME NOT NULL
      );
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");
      CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Product" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "price" REAL NOT NULL,
        "image" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "stock" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "CartItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "CartItem_userId_productId_key" ON "CartItem"("userId", "productId");
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "total" REAL NOT NULL,
        "shippingAddressId" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "OrderItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orderId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL,
        "price" REAL NOT NULL,
        FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Address" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "fullName" TEXT NOT NULL,
        "phoneNumber" TEXT NOT NULL,
        "street" TEXT NOT NULL,
        "city" TEXT NOT NULL,
        "state" TEXT NOT NULL,
        "postalCode" TEXT NOT NULL,
        "country" TEXT NOT NULL DEFAULT 'India',
        "isDefault" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;

    console.log('✅ Database schema created successfully');
    
    // Now import the data
    console.log('📥 Importing data...');
    
    const exportPath = path.join(__dirname, 'exported-data.json');
    if (fs.existsSync(exportPath)) {
      const data = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
      
      // Import users first
      for (const user of data.users) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: user,
          create: user,
        });
      }
      console.log(`✅ Imported ${data.users.length} users`);
      
      // Import products
      for (const product of data.products) {
        await prisma.product.upsert({
          where: { id: product.id },
          update: product,
          create: product,
        });
      }
      console.log(`✅ Imported ${data.products.length} products`);
      
      // Import addresses
      for (const address of data.addresses) {
        await prisma.address.upsert({
          where: { id: address.id },
          update: address,
          create: address,
        });
      }
      console.log(`✅ Imported ${data.addresses.length} addresses`);
      
      // Import orders
      for (const order of data.orders) {
        await prisma.order.upsert({
          where: { id: order.id },
          update: order,
          create: order,
        });
      }
      console.log(`✅ Imported ${data.orders.length} orders`);
      
      // Import order items
      for (const orderItem of data.orderItems) {
        await prisma.orderItem.upsert({
          where: { id: orderItem.id },
          update: orderItem,
          create: orderItem,
        });
      }
      console.log(`✅ Imported ${data.orderItems.length} order items`);
      
      // Import cart items
      for (const cartItem of data.cartItems) {
        await prisma.cartItem.upsert({
          where: { id: cartItem.id },
          update: cartItem,
          create: cartItem,
        });
      }
      console.log(`✅ Imported ${data.cartItems.length} cart items`);
      
    } else {
      console.log('⚠️ No exported data found. Run npm run db:export first.');
    }
    
    console.log('🎉 Successfully deployed to Turso and imported data!');
    
  } catch (error) {
    console.error('❌ Error deploying to Turso:', error);
  }
}

deployToTurso();
