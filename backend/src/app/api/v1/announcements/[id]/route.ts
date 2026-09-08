import { UpdateAnnouncementRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { announcementsService } from "@/modules/announcements/announcements";

export const dynamic = "force-dynamic";

export const PATCH = route({ roles: ["admin"] }, async ({ req, ctx, actor, params }) => {
  const body = await parseBody(req, UpdateAnnouncementRequestSchema);
  const updated = await announcementsService.update(params.id!, body);
  await writeAudit(ctx, actor, { action: "announcement.update", entityType: "announcement", entityId: params.id!, after: body });
  return ok(updated, ctx);
});

export const DELETE = route({ roles: ["admin"] }, async ({ ctx, actor, params }) => {
  const result = await announcementsService.remove(params.id!);
  await writeAudit(ctx, actor, { action: "announcement.remove", entityType: "announcement", entityId: params.id! });
  return ok(result, ctx);
});

export const OPTIONS = PATCH;
