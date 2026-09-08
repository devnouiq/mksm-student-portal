import { CreatePracticeMaterialRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { practiceService } from "@/modules/practice/practice";

export const dynamic = "force-dynamic";

export const GET = route({}, async ({ ctx, actor, url }) => {
  const scope = url.searchParams.get("scope") === "library" ? "library" : "default";
  return ok(await practiceService.view(actor, scope), ctx);
});

export const POST = route({ roles: ["admin", "teacher"] }, async ({ req, ctx, actor }) => {
  const body = await parseBody(req, CreatePracticeMaterialRequestSchema);
  const created = await practiceService.create(actor, body);
  await writeAudit(ctx, actor, { action: "practice_material.create", entityType: "practice_material", entityId: created.id });
  return ok(created, ctx, { status: 201 });
});

export const OPTIONS = GET;
