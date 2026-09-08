import { UpdateTeacherRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { profilesService } from "@/modules/profiles/profiles";

export const dynamic = "force-dynamic";

export const PATCH = route({ roles: ["admin"] }, async ({ req, ctx, actor, params }) => {
  const body = await parseBody(req, UpdateTeacherRequestSchema);
  const updated = await profilesService.updateTeacher(params.id!, body);
  await writeAudit(ctx, actor, { action: "teacher.update", entityType: "profile", entityId: params.id!, after: body });
  return ok(updated, ctx);
});

export const OPTIONS = PATCH;
