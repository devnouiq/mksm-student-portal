/*
  Authentication against Supabase Auth. Login accepts an MKSM number or an email
  as the identifier; MKSM numbers are resolved to the account email first. No
  user enumeration on forgot-password.
*/
import { eq } from "drizzle-orm";
import { MKSM_NO_REGEX, type UserProfile } from "@mksm/contracts";
import { db, schema } from "@/lib/db/client";
import { AppError } from "@/lib/http/errors";
import { anonClient, serviceClient } from "@/lib/supabase/server";
import { toUserProfile } from "@/modules/_shared/user-profile";
import type { Actor } from "@/lib/supabase/auth";

export interface LoginResult {
  user: UserProfile;
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number | null;
    tokenType: string;
  };
}

async function emailForIdentifier(identifier: string): Promise<string | null> {
  const id = identifier.trim();
  if (id.includes("@")) return id.toLowerCase();
  if (!MKSM_NO_REGEX.test(id)) return null;
  const rows = await db
    .select({ email: schema.profiles.email })
    .from(schema.profiles)
    .where(eq(schema.profiles.mksmNo, id))
    .limit(1);
  return rows[0]?.email ?? null;
}

export const authService = {
  async login(identifier: string, password: string): Promise<LoginResult> {
    const email = await emailForIdentifier(identifier);
    if (!email) throw AppError.unauthorized("Incorrect MKSM number / email or password");

    const { data, error } = await anonClient().auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) {
      throw AppError.unauthorized("Incorrect MKSM number / email or password");
    }

    const rows = await db
      .select({
        id: schema.profiles.id,
        role: schema.profiles.role,
        mksmNo: schema.profiles.mksmNo,
        fullName: schema.profiles.fullName,
        email: schema.profiles.email,
        status: schema.profiles.status,
      })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, data.user.id))
      .limit(1);

    const profile = rows[0];
    if (!profile) throw AppError.forbidden("No portal profile for this account");
    if (profile.status !== "active") throw AppError.forbidden("This account is not active");

    return {
      user: toUserProfile(profile),
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at ?? null,
        tokenType: data.session.token_type,
      },
    };
  },

  async currentUser(actor: Actor): Promise<UserProfile> {
    return toUserProfile({
      id: actor.profileId,
      role: actor.role,
      mksmNo: actor.mksmNo,
      fullName: actor.fullName,
      email: actor.email,
    });
  },

  async forgotPassword(email: string): Promise<void> {
    // Fire and forget; never reveal whether the address exists.
    await anonClient()
      .auth.resetPasswordForEmail(email.trim().toLowerCase())
      .catch(() => undefined);
  },

  async logout(token: string): Promise<void> {
    await serviceClient()
      .auth.admin.signOut(token, "local")
      .catch(() => undefined);
  },
};
