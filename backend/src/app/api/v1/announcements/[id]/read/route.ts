import { ok } from "@/lib/http/response";
import { route } from "@/lib/http/with-auth";
import { announcementsService } from "@/modules/announcements/announcements";

export const dynamic = "force-dynamic";

export const POST = route({}, async ({ ctx, actor, params }) => {
  return ok(await announcementsService.markRead(actor, params.id!), ctx);
});

export const OPTIONS = POST;
