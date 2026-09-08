/*
  Student & teacher directories + onboarding. Onboarding creates the Supabase
  Auth user (a random password is set; the account uses the forgot-password flow
  to set its own). The `on_auth_user_created` trigger provisions public.profiles.
*/
import { randomBytes } from "node:crypto";
import { asc, eq, sql } from "drizzle-orm";
import type {
  CreateStudentRequest,
  CreateTeacherRequest,
  StudentDirectoryRow,
  UpdateStudentRequest,
  UpdateTeacherRequest,
} from "@mksm/contracts";
import { db, schema } from "@/lib/db/client";
import { AppError } from "@/lib/http/errors";
import { serviceClient } from "@/lib/supabase/server";
import { fullNameToFirstLast, genderToDb, teacherAccessLevelToDb } from "@/domain/mappers";

function tempPassword(): string {
  return `Mksm-${randomBytes(12).toString("base64url")}-1aA`;
}

const profilesRepo = {
  async directory(filter: { q?: string; batch?: string; country?: string }) {
    const rows = await db.execute<{
      mksm_no: string;
      name: string;
      phone: string | null;
      email: string;
      country: string | null;
      batch_name: string | null;
      classes_30d: number | null;
      classes_90d: number | null;
      last_attended: string | null;
    }>(sql`
      select p.mksm_no, p.full_name as name, p.phone, p.email, p.country,
             (select b.name from enrollments e join batches b on b.id = e.batch_id
              where e.student_id = p.id and e.status = 'active'
              order by e.enrolled_at desc limit 1) as batch_name,
             coalesce(s.classes_30d, 0) as classes_30d,
             coalesce(s.classes_90d, 0) as classes_90d,
             s.last_attended
      from profiles p
      left join v_student_attendance_stats s on s.student_id = p.id
      where p.role = 'student'
        and (${filter.q ? sql`(p.full_name ilike ${"%" + filter.q + "%"} or p.mksm_no ilike ${"%" + filter.q + "%"} or p.email ilike ${"%" + filter.q + "%"})` : sql`true`})
        and (${filter.country ? sql`p.country = ${filter.country}` : sql`true`})
      order by p.full_name
    `);
    let list = rows as unknown as Array<Record<string, unknown>>;
    if (filter.batch) list = list.filter((r) => r["batch_name"] === filter.batch);
    return list.map<StudentDirectoryRow>((r) => ({
      mksmNo: String(r["mksm_no"]),
      name: String(r["name"]),
      phone: (r["phone"] as string) ?? "",
      email: String(r["email"]),
      country: (r["country"] as string) ?? "",
      batchName: (r["batch_name"] as string) ?? "",
      classes30d: Number(r["classes_30d"] ?? 0),
      classes90d: Number(r["classes_90d"] ?? 0),
      lastAttended: (r["last_attended"] as string) ?? null,
    }));
  },

  async findByMksmNo(mksmNo: string) {
    const [row] = await db.select().from(schema.profiles).where(eq(schema.profiles.mksmNo, mksmNo)).limit(1);
    return row ?? null;
  },

  async teachers() {
    return db
      .select({
        id: schema.profiles.id,
        mksmNo: schema.profiles.mksmNo,
        name: schema.profiles.fullName,
        email: schema.profiles.email,
        phone: schema.profiles.phone,
        accessLevel: schema.teacherDetails.accessLevel,
      })
      .from(schema.profiles)
      .leftJoin(schema.teacherDetails, eq(schema.teacherDetails.profileId, schema.profiles.id))
      .where(eq(schema.profiles.role, "teacher"))
      .orderBy(asc(schema.profiles.fullName));
  },
};

async function createAuthUser(meta: Record<string, unknown>, email: string) {
  const { data, error } = await serviceClient().auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password: tempPassword(),
    email_confirm: true,
    user_metadata: meta,
  });
  if (error || !data.user) {
    if (error?.message?.toLowerCase().includes("already")) throw AppError.conflict("An account with that email already exists");
    throw AppError.badRequest(error?.message ?? "Could not create the account");
  }
  return data.user.id;
}

export const profilesService = {
  directory: profilesRepo.directory,

  async createStudent(input: CreateStudentRequest) {
    const userId = await createAuthUser(
      {
        role: "student",
        mksm_no: input.mksmNo,
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
        country: input.country,
        city: input.city,
        postal_address: input.address,
        pincode: input.pincode,
        date_of_birth: input.dob,
        gender: genderToDb(input.gender),
      },
      input.email,
    );

    await db
      .update(schema.studentDetails)
      .set({
        yearsExperience: input.experience ?? null,
        additionalInfo: input.additionalInfo ?? null,
      })
      .where(eq(schema.studentDetails.profileId, userId));

    if (input.batchId) {
      await db
        .insert(schema.enrollments)
        .values({ studentId: userId, batchId: input.batchId })
        .onConflictDoNothing();
    }

    const created = await db
      .select({ id: schema.profiles.id, mksmNo: schema.profiles.mksmNo })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId))
      .limit(1);
    return created[0]!;
  },

  async updateStudent(mksmNo: string, input: UpdateStudentRequest) {
    const profile = await profilesRepo.findByMksmNo(mksmNo);
    if (!profile || profile.role !== "student") throw AppError.notFound("Student not found");

    const patch: Partial<typeof schema.profiles.$inferInsert> = {};
    if (input.firstName !== undefined) patch.firstName = input.firstName;
    if (input.lastName !== undefined) patch.lastName = input.lastName;
    if (input.phone !== undefined) patch.phone = input.phone;
    if (input.country !== undefined) patch.country = input.country;
    if (input.city !== undefined) patch.city = input.city;
    if (input.address !== undefined) patch.postalAddress = input.address;
    if (input.pincode !== undefined) patch.pincode = input.pincode;
    if (input.dob !== undefined) patch.dateOfBirth = input.dob;
    if (input.gender !== undefined) patch.gender = genderToDb(input.gender) ?? undefined;
    if (Object.keys(patch).length > 0) {
      await db.update(schema.profiles).set(patch).where(eq(schema.profiles.id, profile.id));
    }
    if (input.experience !== undefined || input.additionalInfo !== undefined) {
      await db
        .update(schema.studentDetails)
        .set({
          ...(input.experience !== undefined ? { yearsExperience: input.experience } : {}),
          ...(input.additionalInfo !== undefined ? { additionalInfo: input.additionalInfo } : {}),
        })
        .where(eq(schema.studentDetails.profileId, profile.id));
    }
    return { id: profile.id, mksmNo };
  },

  async listTeachers() {
    const rows = await profilesRepo.teachers();
    return rows.map((r) => ({
      id: r.id,
      mksmNo: r.mksmNo,
      name: r.name,
      email: r.email,
      phone: r.phone ?? "",
      accessLevel: r.accessLevel ?? "standard",
    }));
  },

  async createTeacher(input: CreateTeacherRequest) {
    const { firstName, lastName } = fullNameToFirstLast(input.name);
    const userId = await createAuthUser(
      {
        role: "teacher",
        mksm_no: input.mksmNo,
        first_name: firstName,
        last_name: lastName,
        full_name: input.name,
        phone: input.phone,
        postal_address: input.address,
      },
      input.email,
    );
    await db
      .update(schema.teacherDetails)
      .set({ accessLevel: teacherAccessLevelToDb(input.accessLevel) })
      .where(eq(schema.teacherDetails.profileId, userId));

    if (input.batchId) {
      await db.update(schema.batches).set({ teacherId: userId }).where(eq(schema.batches.id, input.batchId));
    }

    const created = await db
      .select({ id: schema.profiles.id, mksmNo: schema.profiles.mksmNo })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId))
      .limit(1);
    return created[0]!;
  },

  async updateTeacher(id: string, input: UpdateTeacherRequest) {
    const [profile] = await db.select().from(schema.profiles).where(eq(schema.profiles.id, id)).limit(1);
    if (!profile || profile.role !== "teacher") throw AppError.notFound("Teacher not found");

    const patch: Partial<typeof schema.profiles.$inferInsert> = {};
    if (input.name !== undefined) {
      const { firstName, lastName } = fullNameToFirstLast(input.name);
      patch.firstName = firstName;
      patch.lastName = lastName;
    }
    if (input.phone !== undefined) patch.phone = input.phone;
    if (input.address !== undefined) patch.postalAddress = input.address;
    if (Object.keys(patch).length > 0) {
      await db.update(schema.profiles).set(patch).where(eq(schema.profiles.id, id));
    }
    if (input.accessLevel !== undefined) {
      await db
        .update(schema.teacherDetails)
        .set({ accessLevel: teacherAccessLevelToDb(input.accessLevel) })
        .where(eq(schema.teacherDetails.profileId, id));
    }
    return { id, mksmNo: profile.mksmNo };
  },
};

export { profilesRepo };
