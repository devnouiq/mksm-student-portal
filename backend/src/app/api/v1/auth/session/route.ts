import { ok } from "@/lib/http/response";
import { route } from "@/lib/http/with-auth";
import { authService } from "@/modules/auth/auth.service";

export const dynamic = "force-dynamic";

export const GET = route({}, async ({ ctx, actor }) => {
  return ok(await authService.currentUser(actor), ctx);
});

export const OPTIONS = GET;
