import { SharePracticeMaterialRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { practiceService } from "@/modules/practice/practice";

export const dynamic = "force-dynamic";

export const POST = route({ roles: ["admin", "teacher"] }, async ({ req, ctx, actor, params }) => {
  const body = await parseBody(req, SharePracticeMaterialRequestSchema);
  const result = await practiceService.share(actor, params.id!, body);
  await writeAudit(ctx, actor, {
    action: "practice_material.share",
    entityType: "practice_material",
    entityId: params.id!,
    after: body,
  });
  return ok(result, ctx, { status: 201 });
});

export const OPTIONS = POST;
