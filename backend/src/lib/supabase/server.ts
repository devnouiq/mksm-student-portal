/*
  Supabase clients for server-side use only.
  - `serviceClient()` uses the SERVICE ROLE key: full access, bypasses RLS. Used
    for auth admin (create user, password reset) and Storage signed URLs. Never
    expose its key or responses containing it to a browser.
  - `anonClient()` uses the public anon key: used for the password grant during
    login and for verifying a caller's access token.
*/
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getConfig } from "../config";

let _service: SupabaseClient | null = null;
let _anon: SupabaseClient | null = null;

export function serviceClient(): SupabaseClient {
  if (_service) return _service;
  const cfg = getConfig();
  _service = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _service;
}

export function anonClient(): SupabaseClient {
  if (_anon) return _anon;
  const cfg = getConfig();
  _anon = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _anon;
}
