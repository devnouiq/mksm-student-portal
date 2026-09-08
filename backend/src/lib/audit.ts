/*
  Append-only audit trail for every mutation. Best-effort: a failed audit write
  is logged but never fails the request it describes.
*/
import { db, schema } from "./db/client";
import type { RequestContext } from "./logger";
import type { Actor } from "./supabase/auth";

export interface AuditEntry {
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
}

export async function writeAudit(
  ctx: RequestContext,
  actor: Actor | null,
  entry: AuditEntry,
): Promise<void> {
  try {
    await db.insert(schema.auditLog).values({
      actorProfileId: actor?.profileId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      before: (entry.before ?? null) as never,
      after: (entry.after ?? null) as never,
      correlationId: ctx.correlationId,
    });
  } catch (err) {
    ctx.logger.warn({ err, entry }, "audit write failed");
  }
}
