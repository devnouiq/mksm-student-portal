import { defineConfig } from "drizzle-kit";

/*
  Drizzle is used for TYPED QUERIES only. The source of truth for the schema is
  the hand-written SQL in `supabase/migrations/`. `drizzle-kit generate` is
  available for scaffolding but generated SQL is reconciled by hand into the
  numbered migration files — never applied blindly.
*/
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  verbose: true,
  strict: true,
});
