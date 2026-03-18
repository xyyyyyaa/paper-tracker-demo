import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config.mjs";
import { createPostgresAdapter } from "../db/postgres-adapter.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, "../db/migrations");

async function main() {
  const database = await createPostgresAdapter(config);
  if (!database.enabled || !database.pool) {
    throw new Error(`Migrations require PostgreSQL. Current status: ${database.reason}`);
  }

  const client = await database.pool.connect();
  try {
    const files = (await readdir(migrationsDir)).filter((name) => name.endsWith(".sql")).sort();
    await client.query("BEGIN");
    await client.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)"
    );

    for (const file of files) {
      const alreadyApplied = await client.query("SELECT 1 FROM schema_migrations WHERE version = $1", [file]);
      if (alreadyApplied.rowCount > 0) {
        continue;
      }

      const sql = await readFile(path.join(migrationsDir, file), "utf8");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [file]);
      console.log(`Applied migration ${file}`);
    }

    await client.query("COMMIT");
    console.log("Migrations complete");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await database.close?.();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
