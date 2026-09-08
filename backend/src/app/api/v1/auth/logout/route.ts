import { ok } from "@/lib/http/response";
import { route } from "@/lib/http/with-auth";
import { bearerToken } from "@/lib/supabase/auth";
import { authService } from "@/modules/auth/auth.service";

export const dynamic = "force-dynamic";

export const POST = route({}, async ({ req, ctx }) => {
  const token = bearerToken(req);
  if (token) await authService.logout(token);
  return ok({ ok: true }, ctx);
});

export const OPTIONS = POST;
