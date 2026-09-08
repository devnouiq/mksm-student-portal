import { UpdateWhatsappConnectionRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { engagementService } from "@/modules/engagement/engagement";

export const dynamic = "force-dynamic";

export const GET = route({ roles: ["admin"] }, async ({ ctx }) => {
  return ok(await engagementService.whatsappConnection(), ctx);
});

export const PUT = route({ roles: ["admin"] }, async ({ req, ctx, actor }) => {
  const body = await parseBody(req, UpdateWhatsappConnectionRequestSchema);
  const result = await engagementService.updateWhatsappConnection(actor, body);
  await writeAudit(ctx, actor, { action: "whatsapp.connection.update", entityType: "integration_setting", after: body });
  return ok(result, ctx);
});

export const OPTIONS = GET;
