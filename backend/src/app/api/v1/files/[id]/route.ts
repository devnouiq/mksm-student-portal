import { ok } from "@/lib/http/response";
import { route } from "@/lib/http/with-auth";
import { filesService } from "@/modules/files/files";

export const dynamic = "force-dynamic";

export const GET = route({}, async ({ ctx, actor, params }) => {
  return ok(await filesService.signedDownloadUrl(actor, params.id!), ctx);
});

export const OPTIONS = GET;
