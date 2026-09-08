import { ok } from "@/lib/http/response";
import { route } from "@/lib/http/with-auth";
import { engagementService } from "@/modules/engagement/engagement";

export const dynamic = "force-dynamic";

export const GET = route({ roles: ["admin"] }, async ({ ctx }) => {
  return ok(await engagementService.whatsappTemplates(), ctx);
});

export const OPTIONS = GET;
