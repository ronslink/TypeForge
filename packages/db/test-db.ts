import postgres from 'postgres';

async function testConnection() {
  const connectionString = 'postgresql://typeforge_admin:4WWQh8fA1RBf7vjoU4oYs1NhQv+kuir+Pz1VNDCkPeE=@157.180.84.79:5432/typeforge_eu';
  
  console.log('Attempting to connect to the database...');
  
  try {
    const sql = postgres(connectionString, {
      max: 1,
      connect_timeout: 15
    });
    
    // Attempt to run a simple query
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
