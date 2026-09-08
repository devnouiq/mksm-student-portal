/*
  Startup configuration. Validated once with zod; an invalid or missing value
  throws immediately so the process never serves traffic in a half-configured
  state (production-readiness).
*/
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().url().refine((u) => u.startsWith("postgres"), "must be a postgres URL"),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(20).default(5),
  DATABASE_STATEMENT_TIMEOUT_MS: z.coerce.number().int().min(1000).max(60_000).default(15_000),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),

  CORS_ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((s) => s.split(",").map((o) => o.trim()).filter(Boolean)),
  HOMEWORK_CUTOFF_DAYS: z.coerce.number().int().min(0).max(14).default(2),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error"]).default("info"),
});

export type AppConfig = z.infer<typeof EnvSchema>;

let cached: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n");
    throw new Error(`Invalid backend configuration:\n${issues}\n\nCopy backend/.env.example to backend/.env.local and fill it in.`);
  }
  cached = parsed.data;
  return cached;
}

/** True only when the DB-touching integration tests are explicitly enabled. */
export const integrationTestsEnabled = process.env.MKSM_TEST_DB === "1";
