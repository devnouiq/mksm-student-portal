import { ok } from "@/lib/http/response";
import { route } from "@/lib/http/with-auth";
import { meService } from "@/modules/me/me";

export const dynamic = "force-dynamic";

export const GET = route({ roles: ["student"] }, async ({ ctx, actor }) => {
  return ok(await meService.courses(actor.profileId), ctx);
});

export const OPTIONS = GET;
