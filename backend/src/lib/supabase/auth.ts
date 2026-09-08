/*
  Resolve the caller from a Supabase access token (Authorization: Bearer ...).
  The token is verified by Supabase Auth; the profile row (role, mksm_no) is
  loaded from the database. Result is the `Actor` every service authorises against.
*/
import { eq } from "drizzle-orm";
import type { Role } from "@mksm/contracts";
import { db, schema } from "../db/client";
import { AppError } from "../http/errors";
import { anonClient } from "./server";

export interface Actor {
  userId: string;
  profileId: string;
  role: Role;
  mksmNo: string;
  email: string;
  fullName: string;
}

const ROLE_MAP: Record<string, Role> = { student: "student", teacher: "teacher", admin: "admin" };

export function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token.trim() : null;
}

export async function resolveActor(req: Request): Promise<Actor> {
  const token = bearerToken(req);
  if (!token) throw AppError.unauthorized();

  const { data, error } = await anonClient().auth.getUser(token);
  if (error || !data.user) throw AppError.unauthorized("Invalid or expired session");

  const rows = await db
    .select({
      id: schema.profiles.id,
      role: schema.profiles.role,
      mksmNo: schema.profiles.mksmNo,
      email: schema.profiles.email,
      fullName: schema.profiles.fullName,
      status: schema.profiles.status,
    })
    .from(schema.profiles)
    .where(eq(schema.profiles.id, data.user.id))
    .limit(1);

  const profile = rows[0];
  if (!profile) throw AppError.forbidden("No portal profile for this account");
  if (profile.status !== "active") throw AppError.forbidden("This account is not active");

  const role = ROLE_MAP[profile.role];
  if (!role) throw AppError.forbidden("Unknown role");

  return {
    userId: data.user.id,
    profileId: profile.id,
    role,
    mksmNo: profile.mksmNo,
    email: profile.email,
    fullName: profile.fullName,
  };
}
