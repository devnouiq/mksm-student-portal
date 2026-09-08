/*
  Seeds demo data that mirrors frontend/src/data/mock/*.

  Step 1 — create the demo Supabase Auth users (idempotent). The
           `on_auth_user_created` trigger provisions the matching public.profiles
           row from user_metadata.
           * Preferred path: the Auth admin API (needs SUPABASE_SERVICE_ROLE_KEY).
           * Fallback (dev only, when the service key is not set yet): insert the
             rows straight into auth.users with a bcrypt password hash.
  Step 2 — run supabase/seed.sql for all domain data (idempotent, ON CONFLICT).

  Usage:  tsx scripts/seed.ts
  Requires: DATABASE_URL (always); SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for
  the preferred path. Demo password: SEED_DEMO_PASSWORD env, else "mksm-demo-Pass123".
*/
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import { requireEnv } from "./_env.ts";

const password = process.env.SEED_DEMO_PASSWORD ?? "mksm-demo-Pass123";

const DEMO_USERS = [
  { mksm_no: "900001", email: "admin@mksm.test", role: "admin", first_name: "Admin", last_name: "Office" },
  { mksm_no: "500112", email: "guru@mksm.test", role: "teacher", first_name: "Guru", last_name: "Deshpande" },
  { mksm_no: "520044", email: "anjali@mksm.test", role: "teacher", first_name: "Anjali", last_name: "Rao" },
  { mksm_no: "100428", email: "melody@mksm.test", role: "student", first_name: "Melody", last_name: "Kulkarni" },
  { mksm_no: "100511", email: "rohan@mksm.test", role: "student", first_name: "Rohan", last_name: "Shinde" },
  { mksm_no: "100522", email: "sneha@mksm.test", role: "student", first_name: "Sneha", last_name: "Joshi" },
  { mksm_no: "100604", email: "arjun@mksm.test", role: "student", first_name: "Arjun", last_name: "Menon" },
  { mksm_no: "100612", email: "kavya@mksm.test", role: "student", first_name: "Kavya", last_name: "Iyer" },
  { mksm_no: "100538", email: "vivek@mksm.test", role: "student", first_name: "Vivek", last_name: "Rao" },
] as const;

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const hasRealServiceKey = serviceKey.length > 20 && !serviceKey.startsWith("REPLACE");

type Sql = ReturnType<typeof postgres>;

async function createUsersViaApi() {
  const supabase = createClient(requireEnv("SUPABASE_URL"), serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: existing } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const byEmail = new Set((existing?.users ?? []).map((u) => u.email));

  for (const u of DEMO_USERS) {
    if (byEmail.has(u.email)) {
      console.log(`  = ${u.email} (${u.mksm_no})`);
      continue;
    }
    const { error } = await supabase.auth.admin.createUser({
      email: u.email,
      password,
      email_confirm: true,
      user_metadata: { role: u.role, mksm_no: u.mksm_no, first_name: u.first_name, last_name: u.last_name },
    });
    if (error) throw new Error(`${u.email}: ${error.message}`);
    console.log(`  + ${u.email} (${u.mksm_no})`);
  }
}

async function createUsersViaSql(sql: Sql) {
  console.log("  (SUPABASE_SERVICE_ROLE_KEY not set — inserting into auth.users directly; dev only)");
  for (const u of DEMO_USERS) {
    const existing = await sql<{ id: string }[]>`select id from auth.users where email = ${u.email} limit 1`;
    if (existing[0]) {
      console.log(`  = ${u.email} (${u.mksm_no})`);
      continue;
    }
    await sql`
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data
      )
      values (
        '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
        ${u.email}, crypt(${password}, gen_salt('bf')),
        now(), now(), now(),
        ${sql.json({ provider: "email", providers: ["email"] })},
        ${sql.json({ role: u.role, mksm_no: u.mksm_no, first_name: u.first_name, last_name: u.last_name })}
      )
    `;
    console.log(`  + ${u.email} (${u.mksm_no})`);
  }
}

async function main() {
  const sql = postgres(requireEnv("DATABASE_URL"), { max: 1, prepare: false });
  try {
    console.log("Step 1: ensure demo auth users ...");
    if (hasRealServiceKey) await createUsersViaApi();
    else await createUsersViaSql(sql);

    console.log("Step 2: run supabase/seed.sql ...");
    const body = readFileSync(resolve(import.meta.dirname, "../supabase/seed.sql"), "utf8");
    await sql.unsafe(body);

    const profileRows = await sql<{ count: string }[]>`select count(*)::text as count from profiles`;
    const batchRows = await sql<{ count: string }[]>`select count(*)::text as count from batches`;
    const subRows = await sql<{ count: string }[]>`select count(*)::text as count from subscriptions`;
    console.log(
      `Done. profiles=${profileRows[0]?.count ?? "?"} batches=${batchRows[0]?.count ?? "?"} subscriptions=${subRows[0]?.count ?? "?"}`,
    );
    console.log(`\nDemo login password for every account: ${password}`);
  } catch (err) {
    console.error("Seed failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

void main();
