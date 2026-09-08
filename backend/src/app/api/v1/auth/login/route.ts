import { LoginRequestSchema } from "@mksm/contracts";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { publicRoute } from "@/lib/http/with-auth";
import { authService } from "@/modules/auth/auth.service";

export const dynamic = "force-dynamic";

export const POST = publicRoute(async ({ req, ctx }) => {
  const body = await parseBody(req, LoginRequestSchema);
  const result = await authService.login(body.identifier, body.password);
  ctx.logger.info({ mksmNo: result.user.mksmNo, role: result.user.role }, "login ok");
  return ok(result, ctx);
});

export const OPTIONS = POST;
