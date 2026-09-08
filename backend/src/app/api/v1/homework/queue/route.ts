import { ok } from "@/lib/http/response";
import { route } from "@/lib/http/with-auth";
import { homeworkService } from "@/modules/homework/homework";

export const dynamic = "force-dynamic";

export const GET = route({ roles: ["teacher"] }, async ({ ctx, actor }) => {
  return ok(await homeworkService.teacherQueue(actor.profileId), ctx);
});

export const OPTIONS = GET;
