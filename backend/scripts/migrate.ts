/*
  Forward-only SQL migration runner for the Supabase Postgres database.

  - Applies every `supabase/migrations/*.sql` file in lexical order that has not
    already been recorded in `public._migrations`.
  - Each file runs inside a single transaction; a failure rolls the whole file
    back and stops (nothing is recorded), so a fixed file can be re-run cleanly.
  - `--status` prints applied / pending without changing anything.

  Usage:  tsx scripts/migrate.ts [--status]
*/
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";
import { requireEnv } from "./_env.ts";

const MIGRATIONS_DIR = resolve(import.meta.dirname, "../supabase/migrations");
const statusOnly = process.argv.includes("--status");

const sql = postgres(requireEnv("DATABASE_URL"), {
  max: 1,
  prepare: false,
  idle_timeout: 10,
  connection: { application_name: "mksm-migrate" },
});

async function main() {
  await sql`
    create table if not exists public._migrations (
      name        text primary key,
      checksum    text not null,
      applied_at  timestamptz not null default now()
    )
  `;
  // Migration ledger: no client access (service_role, used here, bypasses RLS).
  await sql`alter table public._migrations enable row level security`;
  await sql`alter table public._migrations force row level security`;

  const applied = new Map<string, string>(
    (await sql<{ name: string; checksum: string }[]>`select name, checksum from public._migrations`).map(
      (r) => [r.name, r.checksum],
    ),
  );

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (statusOnly) {
    for (const f of files) {
      const body = readFileSync(resolve(MIGRATIONS_DIR, f), "utf8");
      const checksum = createHash("sha256").update(body).digest("hex").slice(0, 12);
      const state = !applied.has(f)
        ? "PENDING"
        : applied.get(f) === checksum
          ? "applied"
          : "APPLIED (checksum drift!)";
      console.log(`${state.padEnd(26)} ${f}`);
    }
    await sql.end();
    return;
  }

  let count = 0;
  for (const f of files) {
    const body = readFileSync(resolve(MIGRATIONS_DIR, f), "utf8");
    const checksum = createHash("sha256").update(body).digest("hex").slice(0, 12);

    if (applied.has(f)) {
      if (applied.get(f) !== checksum) {
        console.warn(`! ${f} already applied but its contents changed since — skipping. Write a new migration instead.`);
      }
      continue;
    }

    process.stdout.write(`-> applying ${f} ... `);
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`insert into public._migrations (name, checksum) values (${f}, ${checksum})`;
    });
    console.log("ok");
    count += 1;
  }

  console.log(count === 0 ? "Nothing to apply — database is up to date." : `Applied ${count} migration(s).`);
  await sql.end();
}

main().catch(async (err) => {
  console.error("\nMigration failed:", err instanceof Error ? err.message : err);
  await sql.end({ timeout: 5 });
  process.exit(1);
});
