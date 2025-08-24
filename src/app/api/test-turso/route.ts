import { NextResponse } from 'next/server';
import { turso, tursoHelpers } from '@/lib/turso';

export async function GET() {
  try {
    // Test basic connection
    const result = await turso.execute('SELECT COUNT(*) as count FROM Product');
    
    return NextResponse.json({
      success: true,
      message: 'Turso connection successful',
      productCount: result.rows[0]?.count || 0
    });
  } catch (error) {
    console.error('Turso connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Test creating a simple table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS test_table (
        id TEXT PRIMARY KEY,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert a test record
    const testId = crypto.randomUUID();
    await turso.execute({
      sql: 'INSERT INTO test_table (id, message) VALUES (?, ?)',
      args: [testId, 'Hello from Turso!']
    });

    // Fetch the record
    const result = await turso.execute({
      sql: 'SELECT * FROM test_table WHERE id = ?',
      args: [testId]
    });

    return NextResponse.json({
      success: true,
      message: 'Test table created and data inserted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Turso test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
