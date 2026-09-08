import { CreateDeaAlertRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { engagementService } from "@/modules/engagement/engagement";

export const dynamic = "force-dynamic";

export const GET = route({ roles: ["teacher", "admin"] }, async ({ ctx, actor }) => {
  return ok(await engagementService.listDea(actor), ctx);
});

export const POST = route({ roles: ["admin"] }, async ({ req, ctx, actor }) => {
  const body = await parseBody(req, CreateDeaAlertRequestSchema);
  const row = await engagementService.createDea(actor, body);
  await writeAudit(ctx, actor, { action: "dea.create", entityType: "de_enrollment_alert", entityId: row.id, after: body });
  return ok(row, ctx, { status: 201 });
});

export const OPTIONS = GET;
