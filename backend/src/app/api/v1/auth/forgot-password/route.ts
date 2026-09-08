import { ForgotPasswordRequestSchema } from "@mksm/contracts";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { publicRoute } from "@/lib/http/with-auth";
import { authService } from "@/modules/auth/auth.service";

export const dynamic = "force-dynamic";

export const POST = publicRoute(async ({ req, ctx }) => {
  const body = await parseBody(req, ForgotPasswordRequestSchema);
  await authService.forgotPassword(body.email);
  // Always 200 — do not reveal whether the address is registered.
  return ok({ ok: true, message: "If that account exists, a reset email has been sent." }, ctx);
});

export const OPTIONS = POST;
