import { createClient } from '@libsql/client';

// Create a singleton Turso client
const globalForTurso = globalThis as unknown as {
  turso: ReturnType<typeof createClient> | undefined
}

function createTursoClient() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_DATABASE_URL or DATABASE_URL is not set');
  }

  if (!authToken) {
    throw new Error('TURSO_AUTH_TOKEN is not set');
  }

  return createClient({
    url,
    authToken
  });
}

export const turso = globalForTurso.turso ?? createTursoClient();

if (process.env.NODE_ENV !== 'production') globalForTurso.turso = turso;

// Helper functions for common operations
export const tursoHelpers = {
  // User operations
  async getUserById(id: string) {
    const result = await turso.execute({
      sql: 'SELECT * FROM User WHERE id = ?',
      args: [id]
    });
    return result.rows[0];
  },

  async getUserByEmail(email: string) {
    const result = await turso.execute({
      sql: 'SELECT * FROM User WHERE email = ?',
      args: [email]
    });
    return result.rows[0];
  },

  async createUser(userData: {
    id: string;
    email: string;
    name?: string;
    password: string;
    role?: string;
  }) {
    const result = await turso.execute({
      sql: `INSERT INTO User (id, email, name, password, role, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [userData.id, userData.email, userData.name, userData.password, userData.role || 'USER']
    });
    return result;
  },

  // Product operations
  async getAllProducts() {
    const result = await turso.execute('SELECT * FROM Product ORDER BY createdAt DESC');
    return result.rows;
  },

  async getProductById(id: string) {
    const result = await turso.execute({
      sql: 'SELECT * FROM Product WHERE id = ?',
      args: [id]
    });
    return result.rows[0];
  },

  // Cart operations
  async getCartItems(userId: string) {
    const result = await turso.execute({
      sql: `SELECT ci.*, p.name, p.price, p.image 
            FROM CartItem ci 
            JOIN Product p ON ci.productId = p.id 
            WHERE ci.userId = ?`,
      args: [userId]
    });
    return result.rows;
  },

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    const result = await turso.execute({
      sql: `INSERT OR REPLACE INTO CartItem (id, userId, productId, quantity, createdAt) 
            VALUES (?, ?, ?, ?, datetime('now'))`,
      args: [crypto.randomUUID(), userId, productId, quantity]
    });
    return result;
  },

  // Order operations
  async createOrder(orderData: {
    id: string;
    userId: string;
    total: number;
    shippingAddressId?: string;
  }) {
    const result = await turso.execute({
      sql: `INSERT INTO "Order" (id, userId, total, shippingAddressId, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [orderData.id, orderData.userId, orderData.total, orderData.shippingAddressId]
    });
    return result;
  },

  async getOrdersByUserId(userId: string) {
    const result = await turso.execute({
      sql: 'SELECT * FROM "Order" WHERE userId = ? ORDER BY createdAt DESC',
      args: [userId]
    });
    return result.rows;
  }
};
