import { z } from "zod";
import { MKSM_NO_REGEX } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { batchesService } from "@/modules/batches/batches";

export const dynamic = "force-dynamic";

const Body = z.object({
  studentMksmNo: z.string().regex(MKSM_NO_REGEX),
  batchId: z.string().uuid(),
});

export const POST = route({ roles: ["admin"] }, async ({ req, ctx, actor }) => {
  const body = await parseBody(req, Body);
  const row = await batchesService.enroll(body.studentMksmNo, body.batchId);
  await writeAudit(ctx, actor, { action: "enrollment.create", entityType: "enrollment", entityId: row.id, after: body });
  return ok(row, ctx, { status: 201 });
});

export const OPTIONS = POST;
