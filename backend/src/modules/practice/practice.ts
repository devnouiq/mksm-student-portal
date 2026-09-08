/*
  Practice material. Admin owns the master library and shares it (to teachers,
  to batches, or to everyone). Teachers upload their own items shareable only to
  their own batches, and may re-share admin items to their own batches. Admin
  items always stay admin-owned (PRD 8.10).
*/
import { eq, sql } from "drizzle-orm";
import type {
  CreatePracticeMaterialRequest,
  PracticeMaterial,
  PracticeMaterialView,
  SharePracticeMaterialRequest,
} from "@mksm/contracts";
import { db, schema } from "@/lib/db/client";
import { AppError } from "@/lib/http/errors";
import { materialKindToApi, materialOwnerToApi, pitchToApi, pitchToDb } from "@/domain/mappers";
import type { Actor } from "@/lib/supabase/auth";

interface MaterialRow extends Record<string, unknown> {
  id: string;
  title: string;
  kind: string;
  pitch: string | null;
  owner_role: string;
  notes: string | null;
  meta: string;
  created_at: string;
  batch_name: string | null;
}

function toMaterial(r: MaterialRow): PracticeMaterial {
  return {
    id: r.id,
    title: r.title,
    kind: materialKindToApi[r.kind] ?? "audio",
    pitch: r.pitch ? (pitchToApi[r.pitch] ?? null) : null,
    ownerRole: materialOwnerToApi[r.owner_role] ?? "admin",
    batchName: r.batch_name,
    notes: r.notes,
    addedAt: new Date(r.created_at).toISOString(),
    meta: r.meta ?? "",
  };
}

const practiceRepo = {
  /** Admin-owned items visible to this viewer. */
  async adminSharedFor(actor: Actor): Promise<MaterialRow[]> {
    const viewerId = actor.profileId;
    return (await db.execute(sql`
      select distinct on (m.id) m.id, m.title, m.kind, m.pitch, m.owner_role, m.notes, m.meta, m.created_at,
        (select b.name from practice_material_shares s2 join batches b on b.id = s2.target_batch_id
         where s2.material_id = m.id and s2.target = 'batch' limit 1) as batch_name
      from practice_materials m
      left join practice_material_shares s on s.material_id = m.id
      where m.owner_role = 'admin'
        and (
          ${actor.role === "admin"} = true
          or s.target = 'all'
          or (s.target = 'teacher' and s.target_teacher_id = ${viewerId})
          or (s.target = 'batch' and s.target_batch_id in (
                select b.id from batches b where b.teacher_id = ${viewerId}
                union
                select e.batch_id from enrollments e where e.student_id = ${viewerId} and e.status = 'active'
             ))
        )
      order by m.id, m.created_at desc
    `)) as unknown as MaterialRow[];
  },

  async ownedBy(profileId: string): Promise<MaterialRow[]> {
    return (await db.execute(sql`
      select m.id, m.title, m.kind, m.pitch, m.owner_role, m.notes, m.meta, m.created_at,
        (select b.name from practice_material_shares s join batches b on b.id = s.target_batch_id
         where s.material_id = m.id and s.target = 'batch' limit 1) as batch_name
      from practice_materials m
      where m.owner_profile_id = ${profileId}
      order by m.created_at desc
    `)) as unknown as MaterialRow[];
  },

  async findById(id: string) {
    const [row] = await db.select().from(schema.practiceMaterials).where(eq(schema.practiceMaterials.id, id)).limit(1);
    return row ?? null;
  },

  async teaches(batchId: string, teacherId: string) {
    const [row] = await db
      .select({ teacherId: schema.batches.teacherId })
      .from(schema.batches)
      .where(eq(schema.batches.id, batchId))
      .limit(1);
    return !!row && row.teacherId === teacherId;
  },
};

export const practiceService = {
  async view(actor: Actor, scope: "default" | "library"): Promise<PracticeMaterialView> {
    if (scope === "library" && actor.role !== "admin") throw AppError.forbidden();
    const [adminShared, own] = await Promise.all([
      practiceRepo.adminSharedFor(actor),
      actor.role === "teacher" ? practiceRepo.ownedBy(actor.profileId) : Promise.resolve([] as MaterialRow[]),
    ]);
    return { adminShared: adminShared.map(toMaterial), own: own.map(toMaterial) };
  },

  async create(actor: Actor, input: CreatePracticeMaterialRequest) {
    if (actor.role !== "admin" && actor.role !== "teacher") throw AppError.forbidden();
    const [row] = await db
      .insert(schema.practiceMaterials)
      .values({
        title: input.title,
        kind: input.kind,
        pitch: input.pitch ? pitchToDb[input.pitch] : null,
        ownerRole: actor.role === "admin" ? "admin" : "teacher",
        ownerProfileId: actor.profileId,
        notes: input.notes ?? null,
        fileId: input.fileId ?? null,
        externalUrl: input.externalUrl ?? null,
        meta: input.meta ?? "",
      })
      .returning({ id: schema.practiceMaterials.id });
    return row!;
  },

  async share(actor: Actor, materialId: string, input: SharePracticeMaterialRequest) {
    const material = await practiceRepo.findById(materialId);
    if (!material) throw AppError.notFound("Material not found");

    if (actor.role === "teacher") {
      // Teachers may only share to their own batches (admin item re-share or own upload).
      if (input.target !== "batch" || !input.batchId) throw AppError.forbidden("Teachers can only share to their own batches");
      const owns = await practiceRepo.teaches(input.batchId, actor.profileId);
      if (!owns) throw AppError.forbidden("Not your batch");
    } else if (actor.role !== "admin") {
      throw AppError.forbidden();
    }

    const [row] = await db
      .insert(schema.practiceMaterialShares)
      .values({
        materialId,
        target: input.target,
        targetTeacherId: input.target === "teacher" ? input.teacherId! : null,
        targetBatchId: input.target === "batch" ? input.batchId! : null,
        sharedByProfileId: actor.profileId,
      })
      .onConflictDoNothing()
      .returning({ id: schema.practiceMaterialShares.id });
    return row ?? { id: null };
  },
};

export { practiceRepo };
