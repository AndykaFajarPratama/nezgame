import 'dotenv/config';
import postgres from 'postgres';

async function checkTables() {
  const sql = postgres(process.env.DATABASE_URL!);
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tables in database:');
    console.log(tables.map(t => t.table_name).join(', '));
    
    for (const table of tables) {
      console.log(`\nColumns for table: ${table.table_name}`);
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = ${table.table_name}
      `;
      console.table(columns);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.end();
  }
}

checkTables();
