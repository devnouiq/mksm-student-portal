import { AdjustAttendanceRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { sessionsService } from "@/modules/sessions/sessions";

export const dynamic = "force-dynamic";

export const PATCH = route({ roles: ["teacher", "admin"] }, async ({ req, ctx, actor, params }) => {
  const body = await parseBody(req, AdjustAttendanceRequestSchema);
  const result = await sessionsService.adjust(actor, params.classSessionId!, body);
  await writeAudit(ctx, actor, {
    action: "attendance.adjust",
    entityType: "class_session",
    entityId: params.classSessionId!,
    after: result,
  });
  return ok(result, ctx);
});

export const OPTIONS = PATCH;
