import { ok } from "@/lib/http/response";
import { route } from "@/lib/http/with-auth";
import { catalogService } from "@/modules/catalog/catalog";

export const dynamic = "force-dynamic";

export const GET = route({}, async ({ ctx, url }) => {
  const yearParam = url.searchParams.get("year");
  const year = yearParam ? Number(yearParam) : undefined;
  return ok(await catalogService.holidays(Number.isFinite(year) ? year : undefined), ctx);
});

export const OPTIONS = GET;
