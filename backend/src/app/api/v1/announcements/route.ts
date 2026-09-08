import { CreateAnnouncementRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { announcementsService } from "@/modules/announcements/announcements";

export const dynamic = "force-dynamic";

export const GET = route({}, async ({ ctx, actor }) => {
  return ok(await announcementsService.list(actor), ctx);
});

export const POST = route({ roles: ["admin"] }, async ({ req, ctx, actor }) => {
  const body = await parseBody(req, CreateAnnouncementRequestSchema);
  const created = await announcementsService.create(actor, body);
  await writeAudit(ctx, actor, { action: "announcement.create", entityType: "announcement", entityId: created.id });
  return ok(created, ctx, { status: 201 });
});

export const OPTIONS = GET;
