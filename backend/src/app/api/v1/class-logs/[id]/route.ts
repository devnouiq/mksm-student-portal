import { UpdateClassLogRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { classLogsService } from "@/modules/classlogs/classlogs";

export const dynamic = "force-dynamic";

export const PATCH = route({ roles: ["teacher", "admin"] }, async ({ req, ctx, actor, params }) => {
  const body = await parseBody(req, UpdateClassLogRequestSchema);
  const row = await classLogsService.update(actor, params.id!, body);
  await writeAudit(ctx, actor, { action: "class_log.update", entityType: "class_log", entityId: params.id!, after: body });
  return ok(row, ctx);
});

export const OPTIONS = PATCH;
