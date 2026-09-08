import { ok } from "@/lib/http/response";
import { route } from "@/lib/http/with-auth";
import { sessionsService } from "@/modules/sessions/sessions";

export const dynamic = "force-dynamic";

// scope=me -> the caller's weekly class schedule (read-only, PRD 5.2).
export const GET = route({ roles: ["teacher"] }, async ({ ctx, actor }) => {
  return ok(await sessionsService.schedule(actor), ctx);
});

export const OPTIONS = GET;
