import { CreateRecordingRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { engagementService } from "@/modules/engagement/engagement";

export const dynamic = "force-dynamic";

export const GET = route({}, async ({ ctx, actor }) => {
  return ok(await engagementService.listRecordingRequests(actor), ctx);
});

export const POST = route({ roles: ["student"] }, async ({ req, ctx, actor }) => {
  const body = await parseBody(req, CreateRecordingRequestSchema);
  const row = await engagementService.createRecordingRequest(actor, body);
  await writeAudit(ctx, actor, { action: "recording_request.create", entityType: "recording_request", entityId: row.id });
  return ok(row, ctx, { status: 201 });
});

export const OPTIONS = GET;
