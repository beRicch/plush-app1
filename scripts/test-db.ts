import "dotenv/config";
import postgres from "postgres";

async function testConnection() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL not found");
    process.exit(1);
  }

  console.log("Connecting to:", connectionString.replace(/:[^:]*@/, ":****@")); // Hide password

  const sql = postgres(connectionString);

  try {
    const result = await sql`SELECT 1 as connected`;
    console.log("Connection successful:", result);
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("Existing tables:", tables.map(t => t.table_name));
    
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await sql.end();
  }
}

testConnection();
