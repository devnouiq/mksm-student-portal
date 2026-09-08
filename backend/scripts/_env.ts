/*
  Loads env for the standalone scripts (migrate / seed). Next.js loads
  `.env.local` on its own for the app; these scripts run under plain tsx so we
  load it here. `.env.local` wins over `.env`.
*/
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

for (const file of [".env", ".env.local"]) {
  const path = resolve(root, file);
  if (existsSync(path)) {
    try {
      process.loadEnvFile(path);
    } catch (err) {
      console.error(`Failed to load ${file}:`, err);
      process.exit(1);
    }
  }
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    console.error(`Missing required env var: ${name}. Copy backend/.env.example to backend/.env.local and fill it in.`);
    process.exit(1);
  }
  return value;
}
