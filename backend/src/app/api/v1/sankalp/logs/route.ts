import { CreateSankalpLogRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { sankalpService } from "@/modules/sankalp/sankalp";

export const dynamic = "force-dynamic";

export const POST = route({ roles: ["student"] }, async ({ req, ctx, actor }) => {
  const body = await parseBody(req, CreateSankalpLogRequestSchema);
  const row = await sankalpService.createLog(actor, body);
  await writeAudit(ctx, actor, { action: "sankalp.log", entityType: "sankalp_log", entityId: row.id, after: body });
  return ok(row, ctx, { status: 201 });
});

export const OPTIONS = POST;
