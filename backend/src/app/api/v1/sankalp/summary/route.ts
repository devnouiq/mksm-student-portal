import { ok } from "@/lib/http/response";
import { route } from "@/lib/http/with-auth";
import { sankalpService } from "@/modules/sankalp/sankalp";

export const dynamic = "force-dynamic";

export const GET = route({ roles: ["student"] }, async ({ ctx, actor }) => {
  return ok(await sankalpService.summary(actor), ctx);
});

export const OPTIONS = GET;
