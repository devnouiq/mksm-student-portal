import { ok } from "@/lib/http/response";
import { route } from "@/lib/http/with-auth";
import { sessionsService } from "@/modules/sessions/sessions";

export const dynamic = "force-dynamic";

export const GET = route({ roles: ["teacher", "admin"] }, async ({ ctx, actor, url }) => {
  const batch = url.searchParams.get("batch")?.trim() || null;
  const date = url.searchParams.get("date")?.trim() || null;
  return ok(await sessionsService.attendance(actor, batch, date), ctx);
});

export const OPTIONS = GET;
