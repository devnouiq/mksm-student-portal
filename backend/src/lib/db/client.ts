/*
  Database access. A single pooled `postgres` connection (Supabase session
  pooler) wrapped by Drizzle. `prepare: false` is required for the pooler;
  a per-statement timeout bounds runaway queries.

  Construction is lazy so `next build` can load route modules without a live
  DATABASE_URL. Route handlers never import this directly — they go through a
  repository. `db` is a proxy that materialises the client on first use.
*/
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getConfig } from "../config";
import * as schema from "./schema";

type Sql = ReturnType<typeof postgres>;
export type Db = PostgresJsDatabase<typeof schema>;

declare global {
  // eslint-disable-next-line no-var
  var __mksmSql: Sql | undefined;
}

let _sql: Sql | undefined;
let _db: Db | undefined;

function makeSql(): Sql {
  const cfg = getConfig();
  return postgres(cfg.DATABASE_URL, {
    max: cfg.DATABASE_POOL_MAX,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
    connection: {
      application_name: "mksm-backend",
      statement_timeout: cfg.DATABASE_STATEMENT_TIMEOUT_MS,
    },
  });
}

export function getSql(): Sql {
  if (!_sql) {
    _sql = global.__mksmSql ?? makeSql();
    if (process.env.NODE_ENV !== "production") global.__mksmSql = _sql;
  }
  return _sql;
}

export function getDb(): Db {
  if (!_db) _db = drizzle(getSql(), { schema, casing: "snake_case" });
  return _db;
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const real = getDb() as unknown as Record<PropertyKey, unknown>;
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export { schema };
