import { ok } from "@/lib/http/response";
import { route } from "@/lib/http/with-auth";
import { sankalpService } from "@/modules/sankalp/sankalp";

export const dynamic = "force-dynamic";

export const GET = route({}, async ({ ctx, url }) => {
  const month = url.searchParams.get("month")?.trim() || undefined;
  return ok(await sankalpService.leaderboard(month), ctx);
});

export const OPTIONS = GET;
