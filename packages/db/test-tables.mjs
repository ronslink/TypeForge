import postgres from 'postgres';

async function testConnection() {
  const connectionString = 'postgresql://typeforge_admin:4WWQh8fA1RBf7vjoU4oYs1NhQv%2Bkuir%2BPz1VNDCkPeE%3D@157.180.84.79:5432/typeforge_eu';
  
  try {
    const sql = postgres(connectionString, { max: 1 });
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tables in database:', tables.map(t => t.table_name));
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

testConnection();
