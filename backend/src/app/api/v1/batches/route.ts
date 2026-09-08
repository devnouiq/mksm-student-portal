import { CreateBatchRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { batchesService } from "@/modules/batches/batches";

export const dynamic = "force-dynamic";

export const GET = route({ roles: ["teacher", "admin"] }, async ({ ctx, actor }) => {
  return ok(await batchesService.listForActor(actor), ctx);
});

export const POST = route({ roles: ["admin"] }, async ({ req, ctx, actor }) => {
  const body = await parseBody(req, CreateBatchRequestSchema);
  const created = await batchesService.create(actor, body);
  await writeAudit(ctx, actor, { action: "batch.create", entityType: "batch", entityId: created.id, after: created });
  return ok(created, ctx, { status: 201 });
});

export const OPTIONS = GET;
