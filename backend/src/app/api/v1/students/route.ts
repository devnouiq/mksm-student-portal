import { CreateStudentRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { profilesService } from "@/modules/profiles/profiles";

export const dynamic = "force-dynamic";

export const GET = route({ roles: ["admin"] }, async ({ ctx, url }) => {
  const rows = await profilesService.directory({
    q: url.searchParams.get("q")?.trim() || undefined,
    batch: url.searchParams.get("batch")?.trim() || undefined,
    country: url.searchParams.get("country")?.trim() || undefined,
  });
  return ok(rows, ctx);
});

export const POST = route({ roles: ["admin"] }, async ({ req, ctx, actor }) => {
  const body = await parseBody(req, CreateStudentRequestSchema);
  const created = await profilesService.createStudent(body);
  await writeAudit(ctx, actor, { action: "student.create", entityType: "profile", entityId: created.id });
  return ok(created, ctx, { status: 201 });
});

export const OPTIONS = GET;
