import { pool } from "../src/db";

async function clearCampaigns() {
  console.log("Connecting to database to clear old seeded campaigns...");
  try {
    const res = await pool.query("DELETE FROM campaigns");
    console.log(`Successfully cleared campaign records from database. Rows deleted: ${res.rowCount}`);
    process.exit(0);
  } catch (err: any) {
    console.error("Failed to clear campaigns:", err.message);
    process.exit(1);
  }
}

clearCampaigns();
