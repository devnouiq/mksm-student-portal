import { CreateSupportRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { catalogService } from "@/modules/catalog/catalog";

export const dynamic = "force-dynamic";

export const POST = route({}, async ({ req, ctx, actor }) => {
  const body = await parseBody(req, CreateSupportRequestSchema);
  const row = await catalogService.createSupportRequest(actor, body.subject, body.message);
  await writeAudit(ctx, actor, { action: "support_request.create", entityType: "support_request", entityId: row.id });
  return ok(row, ctx, { status: 201 });
});

export const OPTIONS = POST;
