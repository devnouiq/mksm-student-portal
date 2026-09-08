import { SubmitHomeworkRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { homeworkService } from "@/modules/homework/homework";

export const dynamic = "force-dynamic";

export const GET = route({ roles: ["student"] }, async ({ ctx, actor }) => {
  return ok(await homeworkService.studentView(actor.profileId), ctx);
});

// Convenience alias: POST /me/homework behaves like POST /homework.
export const POST = route({ roles: ["student"] }, async ({ req, ctx, actor }) => {
  const body = await parseBody(req, SubmitHomeworkRequestSchema);
  const result = await homeworkService.submit(actor, body);
  await writeAudit(ctx, actor, { action: "homework.submit", entityType: "homework_submission", entityId: result.id });
  return ok(result, ctx, { status: 201 });
});

export const OPTIONS = GET;
