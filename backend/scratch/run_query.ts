import 'dotenv/config';
import postgres from 'postgres';

const query = process.argv[2] || "SELECT * FROM products LIMIT 5";

async function runQuery() {
  const sql = postgres(process.env.DATABASE_URL!);
  try {
    console.log(`🚀 Running Query: ${query}\n`);
    const results = await sql.unsafe(query);
    console.table(results);
    console.log(`\n✅ Total Rows: ${results.length}`);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sql.end();
  }
}

runQuery();
