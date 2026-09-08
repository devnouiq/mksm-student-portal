/*
  Reference / catalog data: courses (incl. the "Explore" catalog), holidays,
  help content + support requests, and the admin form option lists.
*/
import { asc, eq, inArray } from "drizzle-orm";
import type {
  AdminFormOptions,
  CatalogCourse,
  HelpView,
  Holiday,
} from "@mksm/contracts";
import { db, schema } from "@/lib/db/client";
import { languageToApi, levelToApi } from "@/domain/mappers";
import type { Actor } from "@/lib/supabase/auth";

const catalogRepo = {
  async courses() {
    return db
      .select()
      .from(schema.courses)
      .orderBy(asc(schema.courses.name));
  },
  async enrolledCourseIds(studentId: string) {
    const rows = await db
      .select({ courseId: schema.batches.courseId })
      .from(schema.enrollments)
      .innerJoin(schema.batches, eq(schema.batches.id, schema.enrollments.batchId))
      .where(eq(schema.enrollments.studentId, studentId));
    return new Set(rows.map((r) => r.courseId));
  },
  async holidays(year?: number) {
    const rows = await db
      .select()
      .from(schema.holidays)
      .orderBy(asc(schema.holidays.holidayDate));
    return year ? rows.filter((r) => r.year === year) : rows;
  },
  async tutorials() {
    return db.select().from(schema.helpTutorials).orderBy(asc(schema.helpTutorials.sortOrder));
  },
  async faqs() {
    return db.select().from(schema.helpFaqs).orderBy(asc(schema.helpFaqs.sortOrder));
  },
  async ragas() {
    return db
      .select({ id: schema.ragas.id, name: schema.ragas.name })
      .from(schema.ragas)
      .where(eq(schema.ragas.isActive, true))
      .orderBy(asc(schema.ragas.sortOrder), asc(schema.ragas.name));
  },
  async batchNames() {
    return db.select({ name: schema.batches.name }).from(schema.batches).orderBy(asc(schema.batches.name));
  },
  async teacherNames() {
    return db
      .select({ name: schema.profiles.fullName })
      .from(schema.profiles)
      .where(inArray(schema.profiles.role, ["teacher"]))
      .orderBy(asc(schema.profiles.fullName));
  },
  async createSupportRequest(requesterId: string, subject: string, message: string) {
    const [row] = await db
      .insert(schema.supportRequests)
      .values({ requesterId, subject, message })
      .returning({ id: schema.supportRequests.id });
    return row!;
  },
};

export const catalogService = {
  async catalog(actor: Actor | null): Promise<CatalogCourse[]> {
    const [courses, enrolled] = await Promise.all([
      catalogRepo.courses(),
      actor?.role === "student" ? catalogRepo.enrolledCourseIds(actor.profileId) : Promise.resolve(new Set<string>()),
    ]);
    return courses
      .filter((c) => c.isCatalogVisible)
      .map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        level: levelToApi[c.level] ?? "Beginner",
        language: languageToApi[c.language] ?? "Hindi",
        priceLabel: enrolled.has(c.id) ? "Enrolled" : c.priceLabel,
        enrolled: enrolled.has(c.id),
      }));
  },

  async holidays(year?: number): Promise<Holiday[]> {
    const rows = await catalogRepo.holidays(year);
    return rows.map((r) => ({ date: r.holidayDate, name: r.name, kind: r.kind }));
  },

  async help(): Promise<HelpView> {
    const [tutorials, faqs] = await Promise.all([catalogRepo.tutorials(), catalogRepo.faqs()]);
    return {
      tutorials: tutorials.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        durationLabel: t.durationLabel,
      })),
      faqs: faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
    };
  },

  async formOptions(): Promise<AdminFormOptions> {
    const [batches, teachers, ragas] = await Promise.all([
      catalogRepo.batchNames(),
      catalogRepo.teacherNames(),
      catalogRepo.ragas(),
    ]);
    return {
      batches: batches.map((b) => b.name),
      teachers: teachers.map((t) => t.name),
      ragas: ragas.map((r) => r.name),
    };
  },

  async ragas() {
    return catalogRepo.ragas();
  },

  async createSupportRequest(actor: Actor, subject: string, message: string) {
    return catalogRepo.createSupportRequest(actor.profileId, subject, message);
  },
};

export { catalogRepo };
