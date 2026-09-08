import { sql as raw } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { ok } from "@/lib/http/response";
import { publicRoute } from "@/lib/http/with-auth";

export const dynamic = "force-dynamic";

export const GET = publicRoute(async ({ ctx }) => {
  let dbOk = false;
  try {
    await db.execute(raw`select 1`);
    dbOk = true;
  } catch (err) {
    ctx.logger.error({ err }, "health: db ping failed");
  }
  return ok(
    {
      status: dbOk ? "ok" : "degraded",
      db: dbOk,
      service: "mksm-backend",
      time: new Date().toISOString(),
    },
    ctx,
    { status: dbOk ? 200 : 503 },
  );
});

export const OPTIONS = GET;
