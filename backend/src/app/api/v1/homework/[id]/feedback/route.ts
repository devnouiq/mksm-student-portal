import { GiveHomeworkFeedbackRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { homeworkService } from "@/modules/homework/homework";

export const dynamic = "force-dynamic";

export const POST = route({ roles: ["teacher", "admin"] }, async ({ req, ctx, actor, params }) => {
  const body = await parseBody(req, GiveHomeworkFeedbackRequestSchema);
  const result = await homeworkService.giveFeedback(actor, params.id!, body);
  await writeAudit(ctx, actor, {
    action: "homework.feedback",
    entityType: "homework_submission",
    entityId: params.id!,
  });
  return ok(result, ctx, { status: 201 });
});

export const OPTIONS = POST;
