import type { Metadata } from "next";
import { CheckCircle, Clock, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Manage WhatsApp" };

const templates = [
  { id: "w-1", name: "Welcome / onboarding", status: "approved" as const, desc: "Sent when a new student is added." },
  { id: "w-2", name: "Class reminder", status: "approved" as const, desc: "Sent before each scheduled class." },
  { id: "w-3", name: "Fee / renewal reminder", status: "pending" as const, desc: "Sent when a subscription is due." },
  { id: "w-4", name: "Homework feedback ready", status: "pending" as const, desc: "Sent when a teacher shares feedback." },
];

export default function AdminWhatsAppPage() {
  return (
    <>
      <PageHeader
        title="Manage WhatsApp"
        description="Configure WhatsApp notifications and message templates."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-md bg-success-100 text-success-500">
                <WhatsappLogo size={24} weight="duotone" />
              </span>
              <div>
                <p className="font-medium text-ink-900">Business account</p>
                <Badge tone="warning">Awaiting Meta verification</Badge>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Meta Business verification can take 2–4 weeks. Until it completes,
              notifications fall back to email (PRD §12.7).
            </p>
            <Button variant="outline" size="sm" className="mt-4">
              Connect provider
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Message templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
              >
                <div>
                  <p className="font-medium text-ink-900">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </div>
                {t.status === "approved" ? (
                  <Badge tone="success">
                    <CheckCircle size={12} weight="fill" /> Approved
                  </Badge>
                ) : (
                  <Badge tone="warning">
                    <Clock size={12} weight="fill" /> Pending
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
