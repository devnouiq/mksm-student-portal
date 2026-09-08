import { CreateTeacherRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { profilesService } from "@/modules/profiles/profiles";

export const dynamic = "force-dynamic";

export const GET = route({ roles: ["admin"] }, async ({ ctx }) => {
  return ok(await profilesService.listTeachers(), ctx);
});

export const POST = route({ roles: ["admin"] }, async ({ req, ctx, actor }) => {
  const body = await parseBody(req, CreateTeacherRequestSchema);
  const created = await profilesService.createTeacher(body);
  await writeAudit(ctx, actor, { action: "teacher.create", entityType: "profile", entityId: created.id });
  return ok(created, ctx, { status: 201 });
});

export const OPTIONS = GET;
