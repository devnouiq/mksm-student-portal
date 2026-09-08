import { SubscriptionSyncRequestSchema } from "@mksm/contracts";
import { writeAudit } from "@/lib/audit";
import { ok } from "@/lib/http/response";
import { parseBody } from "@/lib/http/validate";
import { route } from "@/lib/http/with-auth";
import { subscriptionsService } from "@/modules/subscriptions/subscriptions";

export const dynamic = "force-dynamic";

/*
  Read-only mirror sync. Accepts a payload of subscription + payment records
  (from an external Razorpay/PayPal export or webhook relay) and upserts them.
  No call is made to any payment provider from here (PRD 7 scope guardrail).
*/
export const POST = route({ roles: ["admin"] }, async ({ req, ctx, actor }) => {
  const body = await parseBody(req, SubscriptionSyncRequestSchema);
  const result = await subscriptionsService.sync(body.items);
  await writeAudit(ctx, actor, { action: "subscriptions.sync", entityType: "subscription", after: result });
  return ok(result, ctx);
});

export const OPTIONS = POST;
