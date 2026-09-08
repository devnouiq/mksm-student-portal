import { SignUploadRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { filesService } from "@/modules/files/files";

export const dynamic = "force-dynamic";

export const POST = route({}, async ({ req, ctx, actor }) => {
  const body = await parseBody(req, SignUploadRequestSchema);
  const result = await filesService.signUpload(actor, body);
  await writeAudit(ctx, actor, { action: "file.sign_upload", entityType: "file_object", entityId: result.fileId });
  return ok(result, ctx, { status: 201 });
});

export const OPTIONS = POST;
