import { CreateClassLogRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { AppError } from "@/lib/http/errors";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { classLogsService } from "@/modules/classlogs/classlogs";

export const dynamic = "force-dynamic";

export const GET = route({ roles: ["teacher", "admin"] }, async ({ ctx, actor, url }) => {
  if (actor.role === "teacher" || url.searchParams.get("scope") === "me") {
    if (actor.role === "admin") throw AppError.badRequest("scope=me is for teachers");
    return ok(await classLogsService.teacherView(actor), ctx);
  }
  return ok(
    await classLogsService.adminList({
      teacher: url.searchParams.get("teacher")?.trim() || undefined,
      batch: url.searchParams.get("batch")?.trim() || undefined,
      date: url.searchParams.get("date")?.trim() || undefined,
    }),
    ctx,
  );
});

export const POST = route({ roles: ["teacher", "admin"] }, async ({ req, ctx, actor }) => {
  const body = await parseBody(req, CreateClassLogRequestSchema);
  const row = await classLogsService.create(actor, body);
  await writeAudit(ctx, actor, { action: "class_log.create", entityType: "class_log", entityId: row.id, after: body });
  return ok(row, ctx, { status: 201 });
});

export const OPTIONS = GET;
