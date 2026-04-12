import postgres from 'postgres';

async function testConnection() {
  // Notice URL-encoded plus signs and equals signs!
  const connectionString = 'postgresql://typeforge_admin:4WWQh8fA1RBf7vjoU4oYs1NhQv%2Bkuir%2BPz1VNDCkPeE%3D@157.180.84.79:5432/typeforge_eu';
  
  console.log('Attempting to connect to the database...');
  
  try {
    const sql = postgres(connectionString, {
      max: 1,
      connect_timeout: 15
    });
    
    const result = await sql`SELECT 1 as result, current_database() as db_name`;
    console.log('✅ Connection Successful!');
    console.log('Result:', result);
    
    await sql.end();
  } catch (error) {
    console.error('❌ Connection Failed!');
    console.error(error);
  }
}

testConnection();
