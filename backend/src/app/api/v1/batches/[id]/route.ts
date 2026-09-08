import { UpdateBatchRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { batchesService } from "@/modules/batches/batches";

export const dynamic = "force-dynamic";

export const PATCH = route({ roles: ["admin"] }, async ({ req, ctx, actor, params }) => {
  const body = await parseBody(req, UpdateBatchRequestSchema);
  const updated = await batchesService.update(actor, params.id!, body);
  await writeAudit(ctx, actor, { action: "batch.update", entityType: "batch", entityId: params.id!, after: updated });
  return ok(updated, ctx);
});

export const OPTIONS = PATCH;
