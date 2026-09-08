import { ok } from "@/lib/http/response";
import { route } from "@/lib/http/with-auth";
import { catalogService } from "@/modules/catalog/catalog";

export const dynamic = "force-dynamic";

export const GET = route({}, async ({ ctx }) => {
  return ok(await catalogService.help(), ctx);
});

export const OPTIONS = GET;
