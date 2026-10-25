import { rmSync } from "node:fs";
import { migrate } from "drizzle-orm/libsql/migrator";

// Deletes the local database, applies every migration in ./drizzle, and re-seeds.
// Cross-platform: no shell commands.

async function main() {
  const url = process.env.DATABASE_URL ?? "file:local.db";
  if (!url.startsWith("file:")) throw new Error(`Refusing to reset a non-local database: ${url}`);

  const file = url.slice("file:".length);
  for (const suffix of ["", "-wal", "-shm", "-journal"]) rmSync(file + suffix, { force: true });

  // Imported after the delete so the client opens a fresh file.
  const { db } = await import("@/lib/db");
  const { seed } = await import("./seed");
  await migrate(db, { migrationsFolder: "./drizzle" });
  await seed();
  console.log(`Reset ${file}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
