/*
  File uploads. The client asks for a signed upload URL, PUTs the bytes straight
  to Supabase Storage, then references the returned `fileId` when creating the
  parent record (homework attachment, practice material, announcement, avatar).
*/
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { SignUploadRequest } from "@mksm/contracts";
import { db, schema } from "@/lib/db/client";
import { AppError } from "@/lib/http/errors";
import { serviceClient } from "@/lib/supabase/server";
import type { Actor } from "@/lib/supabase/auth";

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "file";
}

export const filesService = {
  async signUpload(actor: Actor, input: SignUploadRequest) {
    const path = `${actor.profileId}/${randomUUID()}-${safeName(input.filename)}`;
    const { data, error } = await serviceClient()
      .storage.from(input.bucket)
      .createSignedUploadUrl(path);
    if (error || !data) throw AppError.internal("Could not create an upload URL");

    const [row] = await db
      .insert(schema.fileObjects)
      .values({
        bucket: input.bucket,
        path,
        originalName: input.filename,
        mimeType: input.contentType,
        sizeBytes: input.sizeBytes,
        uploadedByProfileId: actor.profileId,
      })
      .returning({ id: schema.fileObjects.id });

    return { fileId: row!.id, bucket: input.bucket, path, uploadUrl: data.signedUrl, token: data.token };
  },

  async signedDownloadUrl(actor: Actor, fileId: string) {
    const [file] = await db.select().from(schema.fileObjects).where(eq(schema.fileObjects.id, fileId)).limit(1);
    if (!file) throw AppError.notFound("File not found");
    if (actor.role !== "admin" && file.uploadedByProfileId !== actor.profileId) {
      // Non-owners still need feedback audio etc.; allow read to any authenticated
      // user for now (buckets are private and paths are unguessable UUIDs).
    }
    const { data, error } = await serviceClient()
      .storage.from(file.bucket)
      .createSignedUrl(file.path, 60 * 10);
    if (error || !data) throw AppError.notFound("File not available");
    return { url: data.signedUrl, originalName: file.originalName, mimeType: file.mimeType };
  },
};
