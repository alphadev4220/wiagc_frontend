import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as schema from "./schema";

// PORTED FROM CLOUDFLARE D1 TO LOCAL SQLITE.
//
// The generated app bound to D1 via `await import("cloudflare:workers")`, a module that does not
// exist outside the Workers runtime -- importing it under Node throws immediately, so the app
// could not start on this server at all. db/schema.ts was already written against
// drizzle-orm/sqlite-core, so the schema itself is portable and only the connection changed.
//
// One connection is opened per process and reused. better-sqlite3 is synchronous and the handle
// is safe to share; opening per request would leak file descriptors under load.
//
// WAL is enabled deliberately: the default rollback journal takes an exclusive lock for the whole
// of each write, so a single slow registration insert blocks every concurrent read. This site
// takes public registrations, and reads (the verify page, QR lookups) must not queue behind them.
const DB_PATH = resolve(process.env.WIAGC_DB_PATH ?? "/mnt/work/wiagc_frontend/data/wiagc.db");

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export async function getDb() {
  if (db) return db;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  // A registration write that loses a lock race should wait rather than throw at the user.
  sqlite.pragma("busy_timeout = 5000");
  db = drizzle(sqlite, { schema });
  return db;
}
