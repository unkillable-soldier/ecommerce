require('dotenv').config();
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

async function deployToTurso() {
  try {
    console.log('🚀 Deploying to Turso...');
    
    // Create Turso client
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    
    console.log('✅ Connected to Turso database');
    
    // Create tables
    console.log('📋 Creating database schema...');
    
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT,
        "email" TEXT NOT NULL UNIQUE,
        "emailVerified" DATETIME,
        "image" TEXT,
        "password" TEXT,
        "role" TEXT NOT NULL DEFAULT 'USER',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      );
    `);

    await client.execute(`
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
    `);

    await client.execute(`
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
        FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "total" REAL NOT NULL,
        "shippingAddressId" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS "OrderItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orderId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL,
        "price" REAL NOT NULL,
        FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS "CartItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE,
        UNIQUE("userId", "productId")
      );
    `);

    console.log('✅ Database schema created successfully');
    
    // Import data
    console.log('📥 Importing data...');
    
    const exportPath = path.join(__dirname, 'exported-data.json');
    if (fs.existsSync(exportPath)) {
      const data = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
      
      // Import users
      for (const user of data.users) {
        await client.execute({
          sql: `INSERT OR REPLACE INTO "User" (id, name, email, emailVerified, image, password, role, createdAt, updatedAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [user.id, user.name, user.email, user.emailVerified, user.image, user.password, user.role, user.createdAt, user.updatedAt]
        });
      }
      console.log(`✅ Imported ${data.users.length} users`);
      
      // Import products
      for (const product of data.products) {
        await client.execute({
          sql: `INSERT OR REPLACE INTO "Product" (id, name, description, price, image, category, stock, createdAt, updatedAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [product.id, product.name, product.description, product.price, product.image, product.category, product.stock, product.createdAt, product.updatedAt]
        });
      }
      console.log(`✅ Imported ${data.products.length} products`);
      
      // Import addresses
      for (const address of data.addresses) {
        await client.execute({
          sql: `INSERT OR REPLACE INTO "Address" (id, userId, type, fullName, phoneNumber, street, city, state, postalCode, country, isDefault, createdAt, updatedAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [address.id, address.userId, address.type, address.fullName, address.phoneNumber, address.street, address.city, address.state, address.postalCode, address.country, address.isDefault, address.createdAt, address.updatedAt]
        });
      }
      console.log(`✅ Imported ${data.addresses.length} addresses`);
      
      // Import orders
      for (const order of data.orders) {
        await client.execute({
          sql: `INSERT OR REPLACE INTO "Order" (id, userId, status, total, shippingAddressId, createdAt, updatedAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [order.id, order.userId, order.status, order.total, order.shippingAddressId, order.createdAt, order.updatedAt]
        });
      }
      console.log(`✅ Imported ${data.orders.length} orders`);
      
      // Import order items
      for (const orderItem of data.orderItems) {
        await client.execute({
          sql: `INSERT OR REPLACE INTO "OrderItem" (id, orderId, productId, quantity, price) 
                VALUES (?, ?, ?, ?, ?)`,
          args: [orderItem.id, orderItem.orderId, orderItem.productId, orderItem.quantity, orderItem.price]
        });
      }
      console.log(`✅ Imported ${data.orderItems.length} order items`);
      
      // Import cart items
      for (const cartItem of data.cartItems) {
        await client.execute({
          sql: `INSERT OR REPLACE INTO "CartItem" (id, userId, productId, quantity, createdAt) 
                VALUES (?, ?, ?, ?, ?)`,
          args: [cartItem.id, cartItem.userId, cartItem.productId, cartItem.quantity, cartItem.createdAt]
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
