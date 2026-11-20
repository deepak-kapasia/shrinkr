import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { pool } from "../src/db/pool";

async function main(): Promise<void> {
  const schema = await readFile(path.join(__dirname, "../schema.sql"), "utf8");
  await pool.query(schema);
  console.log("Database schema is ready.");
  await pool.end();
}

main().catch(async (error: unknown) => {
  console.error("Could not set up the database:", error);
  await pool.end();
  process.exitCode = 1;
});
