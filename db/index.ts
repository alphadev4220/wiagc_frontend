import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as schema from "./schema";
import { SEED } from "../lib/speakers";

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
  ensureSpeakers(sqlite);
  db = drizzle(sqlite, { schema });
  return db;
}

// The speakers table is created here rather than through a drizzle migration.
//
// Nothing in this deployment RUNS migrations -- `drizzle-kit generate` only writes SQL files,
// and the registrations table was applied by hand. A table the app needs in order to render its
// own home page cannot depend on someone remembering to do that, so it is created idempotently
// at startup and seeded once from lib/speakers.ts.
//
// The seed runs ONLY when the table is empty. Deleting every speaker from /admin is a deliberate
// act, and having them silently reappear on the next restart would be worse than an empty page.
function ensureSpeakers(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS speakers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      "group" TEXT NOT NULL DEFAULT 'guest',
      name TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'Guest Speaker',
      bio TEXT NOT NULL DEFAULT '',
      photo_path TEXT NOT NULL DEFAULT '',
      photo_data BLOB,
      photo_type TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
  const { n } = sqlite.prepare("SELECT COUNT(*) AS n FROM speakers").get() as { n: number };
  if (n > 0) return;
  const insert = sqlite.prepare(`INSERT INTO speakers
    ("group", name, country, role, bio, photo_path, sort_order)
    VALUES (@group, @name, @country, @role, @bio, @photoPath, @sortOrder)`);
  sqlite.transaction(() => { for (const s of SEED) insert.run(s); })();
}
