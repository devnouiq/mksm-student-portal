-- 0001_extensions
-- Enable the Postgres extensions the schema relies on.
-- Rollback: DROP EXTENSION statements (safe to leave installed).

create extension if not exists pgcrypto;      -- gen_random_uuid()
create extension if not exists citext;         -- case-insensitive email
create extension if not exists pg_trgm;        -- trigram search indexes
create extension if not exists moddatetime schema extensions; -- updated_at trigger helper
