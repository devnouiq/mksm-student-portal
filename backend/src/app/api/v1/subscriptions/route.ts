import { ok } from "@/lib/http/response";
import { route } from "@/lib/http/with-auth";
import { subscriptionsService } from "@/modules/subscriptions/subscriptions";

export const dynamic = "force-dynamic";

export const GET = route({ roles: ["admin"] }, async ({ ctx }) => {
  return ok(await subscriptionsService.list(), ctx);
});

export const OPTIONS = GET;
