import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "MKSM Policy" };

const sections = [
  {
    title: "Attendance & Classes",
    body: "Students are expected to join their scheduled online classes on time. On a class day, use ‘Join Now’ from My Courses — attendance is marked Present (Online) automatically. If you miss a class, you may request a recording from My Courses; recordings are shared manually by your teacher.",
  },
  {
    title: "Homework",
    body: "Homework is weekly and tied to your class schedule. Submit at least two days before the next class. Later submissions are still accepted but are tagged as a Late Submission for your teacher.",
  },
  {
    title: "Subscriptions & Fees",
    body: "Subscription status is read directly from Razorpay (India) or PayPal (international). The portal does not process payments. Keep your subscription active to retain access; you can re-activate or change your payment method from Payment & Fees.",
  },
  {
    title: "Sankalp Pledge",
    body: "Sankalp hours are self-reported and keyed to your 6-digit MKSM number. They contribute to the school-wide pledge shown on your Overview. Please log hours honestly.",
  },
  {
    title: "Conduct & Community",
    body: "Treat teachers and fellow students with respect. Practice material shared with you is for personal learning only and must not be redistributed.",
  },
];

export default function StudentPolicyPage() {
  return (
    <>
      <PageHeader
        title="MKSM Policy"
        description="School policies for students. Please review them periodically."
      />
      <Card>
        <CardContent className="space-y-6 pt-6">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-lg text-ink-900">{s.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
          <p className="border-t border-border pt-4 text-xs text-ink-400">
            For questions about this policy, contact the MKSM office.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
