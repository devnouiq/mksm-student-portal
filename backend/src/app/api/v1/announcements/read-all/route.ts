import { ok } from "@/lib/http/response";
import { route } from "@/lib/http/with-auth";
import { announcementsService } from "@/modules/announcements/announcements";

export const dynamic = "force-dynamic";

export const POST = route({}, async ({ ctx, actor }) => {
  return ok(await announcementsService.markAllRead(actor), ctx);
});

export const OPTIONS = POST;
