import { UpdateRecordingRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { engagementService } from "@/modules/engagement/engagement";

export const dynamic = "force-dynamic";

export const PATCH = route({ roles: ["teacher", "admin"] }, async ({ req, ctx, actor, params }) => {
  const body = await parseBody(req, UpdateRecordingRequestSchema);
  const row = await engagementService.updateRecordingRequest(actor, params.id!, body);
  await writeAudit(ctx, actor, { action: "recording_request.update", entityType: "recording_request", entityId: params.id!, after: body });
  return ok(row, ctx);
});

export const OPTIONS = PATCH;
