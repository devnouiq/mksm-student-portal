/*
  Subscriptions — a READ-ONLY local mirror of Razorpay / PayPal status + payment
  history (PRD 7). `sync` upserts from a supplied payload; there is no live call
  to any payment provider in scope.
*/
import { eq, sql } from "drizzle-orm";
import type { SubscriptionRow, SubscriptionSyncItem } from "@mksm/contracts";
import { db, schema } from "@/lib/db/client";
import { AppError } from "@/lib/http/errors";
import { providerToApi, providerToDb, subStatusToApi, subStatusToDb } from "@/domain/mappers";

const subsRepo = {
  async directory() {
    return (await db.execute(sql`
      select s.external_subscription_id as sub_id, s.provider, s.status,
             s.active_cycle, s.paid_cycle, s.start_date, s.next_due_date,
             p.mksm_no, p.full_name as student_name, p.email, p.phone, p.country,
             date_part('year', age(p.date_of_birth))::int as age,
             (select b.name from enrollments e join batches b on b.id = e.batch_id
              where e.student_id = s.student_id and e.status = 'active' order by e.enrolled_at desc limit 1) as batch_name,
             coalesce(c.payments_this_year, 0) as payments_this_year,
             coalesce(c.payments_last_3_months, 0) as payments_last_3_months
      from subscriptions s
      join profiles p on p.id = s.student_id
      left join v_subscription_payment_counts c on c.subscription_id = s.id
      order by p.full_name
    `)) as unknown as Array<Record<string, unknown>>;
  },

  async profileIdByMksmNo(mksmNo: string) {
    const [row] = await db.select({ id: schema.profiles.id }).from(schema.profiles).where(eq(schema.profiles.mksmNo, mksmNo)).limit(1);
    return row?.id ?? null;
  },
};

export const subscriptionsService = {
  async list(): Promise<SubscriptionRow[]> {
    const rows = await subsRepo.directory();
    return rows.map((r) => ({
      mksmNo: String(r["mksm_no"]),
      studentName: String(r["student_name"]),
      batchName: String(r["batch_name"] ?? ""),
      age: Number(r["age"] ?? 0),
      email: String(r["email"] ?? ""),
      phone: String(r["phone"] ?? ""),
      country: String(r["country"] ?? ""),
      provider: providerToApi[String(r["provider"])] ?? "razorpay",
      subId: String(r["sub_id"]),
      status: subStatusToApi[String(r["status"])] ?? "active",
      activeCycle: Number(r["active_cycle"] ?? 0),
      paidCycle: Number(r["paid_cycle"] ?? 0),
      startDate: r["start_date"] ? String(r["start_date"]) : "",
      nextDue: r["next_due_date"] ? String(r["next_due_date"]) : null,
      paymentsThisYear: Number(r["payments_this_year"] ?? 0),
      paymentsLast3Months: Number(r["payments_last_3_months"] ?? 0),
    }));
  },

  async sync(items: SubscriptionSyncItem[]) {
    let subscriptionsUpserted = 0;
    let paymentsUpserted = 0;

    for (const item of items) {
      const studentId = await subsRepo.profileIdByMksmNo(item.studentMksmNo);
      if (!studentId) throw AppError.badRequest(`Unknown student MKSM number: ${item.studentMksmNo}`);

      const [sub] = await db
        .insert(schema.subscriptions)
        .values({
          studentId,
          courseId: item.courseId ?? null,
          provider: providerToDb[item.provider],
          externalSubscriptionId: item.externalSubscriptionId,
          status: subStatusToDb[item.status],
          activeCycle: item.activeCycle,
          paidCycle: item.paidCycle,
          startDate: item.startDate ?? null,
          nextDueDate: item.nextDueDate ?? null,
          pendingDuesMinor: item.pendingDuesMinor,
          syncedAt: new Date(),
          raw: item as never,
        })
        .onConflictDoUpdate({
          target: [schema.subscriptions.provider, schema.subscriptions.externalSubscriptionId],
          set: {
            status: subStatusToDb[item.status],
            activeCycle: item.activeCycle,
            paidCycle: item.paidCycle,
            nextDueDate: item.nextDueDate ?? null,
            pendingDuesMinor: item.pendingDuesMinor,
            syncedAt: new Date(),
          },
        })
        .returning({ id: schema.subscriptions.id });
      subscriptionsUpserted += 1;

      for (const p of item.payments ?? []) {
        await db
          .insert(schema.subscriptionPayments)
          .values({
            subscriptionId: sub!.id,
            externalPaymentId: p.externalPaymentId,
            amountMinor: p.amountMinor,
            currency: p.currency,
            status: p.status,
            paidAt: new Date(p.paidAt),
            raw: p as never,
          })
          .onConflictDoNothing();
        paymentsUpserted += 1;
      }
    }
    return { subscriptionsUpserted, paymentsUpserted };
  },
};

export { subsRepo };
