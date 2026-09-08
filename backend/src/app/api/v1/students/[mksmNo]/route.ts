import { UpdateStudentRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { profilesService } from "@/modules/profiles/profiles";

export const dynamic = "force-dynamic";

export const GET = route({ roles: ["admin"] }, async ({ ctx, params }) => {
  const rows = await profilesService.directory({ q: params.mksmNo });
  const row = rows.find((r) => r.mksmNo === params.mksmNo);
  if (!row) return ok(null, ctx, { status: 404 });
  return ok(row, ctx);
});

export const PATCH = route({ roles: ["admin"] }, async ({ req, ctx, actor, params }) => {
  const body = await parseBody(req, UpdateStudentRequestSchema);
  const updated = await profilesService.updateStudent(params.mksmNo!, body);
  await writeAudit(ctx, actor, { action: "student.update", entityType: "profile", entityId: updated.id, after: body });
  return ok(updated, ctx);
});

export const OPTIONS = GET;
