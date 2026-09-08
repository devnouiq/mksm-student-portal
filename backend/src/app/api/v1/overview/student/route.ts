import { ok } from "@/lib/http/response";
import { route } from "@/lib/http/with-auth";
import { overviewService } from "@/modules/overview/overview";

export const dynamic = "force-dynamic";

export const GET = route({ roles: ["student"] }, async ({ ctx, actor }) => {
  return ok(await overviewService.student(actor), ctx);
});

export const OPTIONS = GET;
